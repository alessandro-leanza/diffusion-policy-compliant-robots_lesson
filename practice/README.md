# Practice Session — Diffusion Models & Diffusion Policy

Hands-on notebooks for the ~2-hour practice block, adapted from
[`chaos2clarity`](https://github.com/vincenzopomponi/chaos2clarity)
(V. Pomponi, PoliMi) and made **Colab-ready**: a *Setup* cell at the top of
each notebook installs/checks every dependency, and notebook 05 downloads its
dataset automatically.

## How students run them (Google Colab — recommended)

1. Click the **Open in Colab** badge at the top of a notebook.
2. **Runtime → Change runtime type → Hardware accelerator → GPU** (T4 is enough).
3. **Runtime → Run all.**

No local installation required — Colab ships PyTorch, torchvision, NumPy,
matplotlib, Pillow and tqdm. The badges point at this repository, so they only
work once these files are **pushed to GitHub** and the repo is **public** (or the
student is logged into GitHub in Colab). Alternatively, students can use
**File → Upload notebook** in Colab and run the same cells.

## Notebooks

| # | Notebook | Topic | Data | Heavy compute |
|---|----------|-------|------|---------------|
| 01 | `01_data_modalities.ipynb` | Images / video / trajectories as tensors | synthetic | no |
| 02 | `02_forward_reverse_diffusion.ipynb` | Forward & reverse process, noise schedules, SNR | synthetic | no |
| 03 | `03_training_pipeline.ipynb` | Full DDPM trained on MNIST | MNIST (auto-download) | ~20 epochs training |
| 04 | `04_architectures.ipynb` | U-Net, +attention, 1D U-Net, DiT (forward pass + benchmark) | none | no |
| 05 | `05_diffusion_policy_pusht.ipynb` | Diffusion Policy on the real Push-T dataset | Push-T (~31 MB, auto-download) | ~100 epochs training |

All five were tested end-to-end on an NVIDIA GPU (PyTorch 2.9, CUDA).

### Notes on timing (Colab T4, approximate)
- 01, 02, 04: run in seconds.
- 03: MNIST training, `NUM_EPOCHS = 20` by default (~15–30 min). Lower it for a
  quick demo; raise it for sharper samples.
- 05: Push-T training, `NUM_EPOCHS = 100` by default (~30–40 min; a checkpoint is
  saved every 10 epochs). Start it, then discuss theory while it trains. Lower to
  ~30 for a fast smoke run.

### Notebook 05 — what was changed vs the original
- Added a **dataset download cell** (`pusht_cchi_v7_replay.zarr.zip`, ~31 MB, via
  `gdown`) — the original assumed the dataset was already on disk.
- The dataset reader uses **zarr ≥ 3** (`zarr_format=2`), which requires
  **Python ≥ 3.11** — fine on Colab; see the local note below.
- `NUM_EPOCHS` lowered from 1200 → 100 to fit a live session.

## Running locally (fallback)

You need a GPU for 03/05 to be comfortable (CPU works but is slow). With conda:

```bash
conda create -n diffusion-practice python=3.11 -y
conda activate diffusion-practice

# PyTorch — pick the command for your CUDA from https://pytorch.org/get-started/locally/
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# Notebook dependencies
pip install numpy matplotlib Pillow tqdm jupyter zarr gdown

jupyter notebook
```

> **Python ≥ 3.11 is required** for notebook 05: it uses zarr v3
> (`zarr_format=2`), and zarr v3 does not install on Python 3.10.
