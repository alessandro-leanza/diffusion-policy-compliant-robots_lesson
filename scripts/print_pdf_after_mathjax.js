#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");

const [, , portArg, outputPath] = process.argv;
const port = Number(portArg);

if (!port || !outputPath) {
  console.error("Usage: print_pdf_after_mathjax.js <devtools-port> <output-pdf>");
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
  let lastError;

  while (Date.now() < deadline) {
    try {
      const tabs = await getJson(`http://127.0.0.1:${port}/json`);
      const tab =
        tabs.find(
          (candidate) =>
            candidate.type === "page" &&
            !candidate.url.startsWith("chrome-extension://") &&
            candidate.url.includes("slides.html"),
        ) ||
        tabs.find(
          (candidate) =>
            candidate.type === "page" &&
            !candidate.url.startsWith("chrome-extension://"),
        );
      if (tab?.webSocketDebuggerUrl) {
        return tab;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw lastError || new Error("Chrome DevTools tab was not available");
}

async function main() {
  const tab = await getTab();
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.id} failed: ${JSON.stringify(message.error)}`));
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
      }, 300000);
      pending.set(messageId, {
        resolve,
        reject: (error) => reject(new Error(`${method} ${error.message}`)),
        timer,
      });
      socket.send(JSON.stringify({ id: messageId, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");

  const waitExpression = String.raw`
    new Promise((resolve) => {
      const done = () => {
        const bodyText = document.body ? document.body.innerText : "";
        const mathErrors = (bodyText.match(/Math Processing Error|TeX parse error/g) || []).length;
        const pendingPreviews = document.querySelectorAll(".MathJax_Preview").length;
        const mathNodes = document.querySelectorAll(".MathJax, .MathJax_Display, mjx-container, math").length;
        const slideCount = window.Reveal && Reveal.getSlides ? Reveal.getSlides().length : 0;
        const nonTitleSlideCount = window.Reveal && Reveal.getSlides
          ? Reveal.getSlides().filter((slide) =>
              !(
                slide.id === "title-slide" ||
                slide.classList.contains("title-slide") ||
                slide.classList.contains("section-divider")
              )
            ).length
          : 0;
        const pdfPageCount = document.querySelectorAll(".pdf-page").length;
        const footerCount = document.querySelectorAll(".footer-slide-number").length;
        const revealReady = !window.Reveal || !Reveal.isReady || Reveal.isReady();
        const printPdf = location.search.includes("print-pdf");
        resolve({
          readyState: document.readyState,
          mathErrors,
          pendingPreviews,
          mathNodes,
          slideCount,
          nonTitleSlideCount,
          pdfPageCount,
          footerCount,
          revealReady,
          printPdf,
        });
      };

      if (window.MathJax && MathJax.Hub && MathJax.Hub.Queue) {
        MathJax.Hub.Queue(done);
      } else {
        done();
      }
    })
  `;

  const deadline = Date.now() + 60000;
  let state = null;

  while (Date.now() < deadline) {
    const response = await send("Runtime.evaluate", {
      expression: waitExpression,
      awaitPromise: true,
      returnByValue: true,
    });
    state = response.result?.result?.value;

    if (
      state &&
      state.readyState === "complete" &&
      state.mathErrors === 0 &&
      state.pendingPreviews === 0 &&
      state.mathNodes > 0 &&
      state.revealReady &&
      state.footerCount >= state.nonTitleSlideCount &&
      (!state.printPdf || state.pdfPageCount >= state.slideCount)
    ) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (
    !state ||
    state.readyState !== "complete" ||
    state.mathErrors !== 0 ||
    state.pendingPreviews !== 0 ||
    state.mathNodes === 0 ||
    !state.revealReady ||
    state.footerCount < state.nonTitleSlideCount ||
    (state.printPdf && state.pdfPageCount < state.slideCount)
  ) {
    throw new Error(`MathJax did not finish cleanly: ${JSON.stringify(state)}`);
  }

  const pdf = await send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
  });

  if (pdf.result.data) {
    fs.writeFileSync(outputPath, Buffer.from(pdf.result.data, "base64"));
  } else if (pdf.result.stream) {
    const chunks = [];
    while (true) {
      const chunk = await send("IO.read", { handle: pdf.result.stream });
      if (chunk.result.data) {
        chunks.push(Buffer.from(chunk.result.data, chunk.result.base64Encoded ? "base64" : "utf8"));
      }
      if (chunk.result.eof) {
        break;
      }
    }
    await send("IO.close", { handle: pdf.result.stream });
    fs.writeFileSync(outputPath, Buffer.concat(chunks));
  } else {
    throw new Error("Chrome did not return PDF data or a PDF stream");
  }

  socket.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
