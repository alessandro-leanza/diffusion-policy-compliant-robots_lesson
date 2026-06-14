# Practice Session — Diffusion Models & Diffusion Policy

Hands-on notebooks for the practice block, adapted from
[`chaos2clarity`](https://github.com/vincenzopomponi/chaos2clarity)
(V. Pomponi, PoliMi) and made **Colab-ready**: a *Setup* cell at the top of each
notebook installs/checks every dependency, and notebook 05 downloads its dataset
automatically.

## How to run (Google Colab — recommended)

1. Click the **Open in Colab** badge at the top of a notebook
   (or use **File → Upload notebook** in Colab).
2. Enable a GPU: **Runtime → Change runtime type → Hardware accelerator → GPU**.
3. **Runtime → Run all.**

No local installation required — Colab already ships PyTorch, torchvision, NumPy,
matplotlib, Pillow and tqdm.

## Notebooks

| # | Notebook | Topic | Data |
|---|----------|-------|------|
| 01 | `01_data_modalities.ipynb` | Images / video / trajectories as tensors | synthetic |
| 02 | `02_forward_reverse_diffusion.ipynb` | Forward & reverse process, noise schedules, SNR | synthetic |
| 03 | `03_training_pipeline.ipynb` | Full DDPM trained on MNIST | MNIST (auto-download) |
| 04 | `04_architectures.ipynb` | U-Net, +attention, 1D U-Net, DiT (forward pass + benchmark) | none |
| 05 | `05_diffusion_policy_pusht.ipynb` | Diffusion Policy on the real Push-T dataset | Push-T (~31 MB, auto-download) |

Notebooks 01, 02 and 04 run in seconds. Notebooks 03 and 05 include a training
loop that runs for several minutes on a Colab T4 — that is expected; you can
lower `NUM_EPOCHS` in the config cell for a quicker run.

## Running locally (optional)

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

> **Python ≥ 3.11 is required** for notebook 05: it uses zarr v3, which does not
> install on Python 3.10.
