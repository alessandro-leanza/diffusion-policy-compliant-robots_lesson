#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const [, , portArg, outputDir] = process.argv;
const port = Number(portArg);

if (!port || !outputDir) {
  console.error("Usage: capture_pdf_pages.js <devtools-port> <output-dir>");
  process.exit(2);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

async function getTab() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const tabs = await getJson(`http://127.0.0.1:${port}/json`);
      const tab = tabs.find(
        (candidate) =>
          candidate.type === "page" &&
          !candidate.url.startsWith("chrome-extension://") &&
          candidate.url.includes("slides.html"),
      );
      if (tab?.webSocketDebuggerUrl) {
        return tab;
      }
    } catch {
      // Retry until Chrome exposes the page target.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Chrome DevTools slides tab was not available");
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const tab = await getTab();
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer, method } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${method} failed: ${JSON.stringify(message.error)}`));
      } else {
        resolve(message);
      }
    }
  };

  await new Promise((resolve) => {
    socket.onopen = resolve;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const messageId = ++id;
      const timer = setTimeout(() => {
        pending.delete(messageId);
        reject(new Error(`${method} timed out`));
      }, 60000);
      pending.set(messageId, { resolve, reject, timer, method });
      socket.send(JSON.stringify({ id: messageId, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");

  const readyExpression = String.raw`
    ({
      readyState: document.readyState,
      slideCount: window.Reveal && Reveal.getSlides ? Reveal.getSlides().length : 0,
      pdfPageCount: document.querySelectorAll(".pdf-page").length
    })
  `;

  let state = null;
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    const response = await send("Runtime.evaluate", {
      expression: readyExpression,
      returnByValue: true,
    });
    state = response.result.result.value;
    if (
      state.readyState === "complete" &&
      state.slideCount > 1 &&
      state.pdfPageCount >= state.slideCount
    ) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (
    !state ||
    state.readyState !== "complete" ||
    state.slideCount <= 1 ||
    state.pdfPageCount < state.slideCount
  ) {
    throw new Error(`Reveal print pages were not ready: ${JSON.stringify(state)}`);
  }

  const rectsResponse = await send("Runtime.evaluate", {
    expression: String.raw`
      Array.from(document.querySelectorAll(".pdf-page")).map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          index,
          x: rect.x + scrollX,
          y: rect.y + scrollY,
          width: rect.width,
          height: rect.height
        };
      })
    `,
    returnByValue: true,
  });
  const rects = rectsResponse.result.result.value;

  for (const rect of rects) {
    const screenshot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scale: 2,
      },
    });
    const filename = path.join(outputDir, `page-${String(rect.index + 1).padStart(3, "0")}.png`);
    fs.writeFileSync(filename, Buffer.from(screenshot.result.data, "base64"));
  }

  socket.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
