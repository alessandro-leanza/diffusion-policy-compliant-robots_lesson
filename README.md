# Diffusion Policy for Compliant Robots

Public student repository for the graduate-level robotics / machine learning lecture:

**Diffusion Policy for Compliant Robots: From Imitation Learning to Variable Admittance Control**

The lecture PDF is available directly in this repository:

- [`slides.pdf`](slides.pdf)

The source deck is written in Quarto/reveal.js for students who want to inspect or reuse the material.

## Overview

This lecture introduces diffusion-based robot policies as a modern approach to learning complex manipulation behavior from demonstrations. It starts from imitation learning and behavioral cloning, then builds toward generative action models that can represent multimodal robot behavior.

The second part connects learned action generation with the constraints of physical robot control. In particular, it focuses on contact-rich and compliant robots, where safe execution depends not only on where the robot moves, but also on how it reacts to forces through impedance or admittance control.

## Learning Objectives

After the lecture, students should understand:

- why imitation learning is useful in robotics
- limitations of behavioral cloning
- why diffusion models are useful for multimodal action generation
- how Diffusion Policy generates action trajectories
- why inference latency matters for robot control
- why compliant and contact-rich robots require force-aware control
- how diffusion policies can be combined with variable admittance/impedance control

## Lecture Structure

1. Motivation and compliant robots
2. Brief imitation learning background
3. Diffusion models essentials
4. Diffusion Policy
5. Inference efficiency for robot control
6. Compliant control: impedance and admittance
7. Diffusion Policy + variable admittance control
8. Open research questions

## Target Audience

The material is intended for graduate students or researchers with basic familiarity with robotics, machine learning, or control.

## Course / Teaching Context

Used for: AI Applications to Industrial Robotics, PhD Course at Politecnico di Milano (POLIMI), 2025/2026

## For Students

Start from [`slides.pdf`](slides.pdf). The `practice/` folder contains companion notebooks for the diffusion-model and Diffusion Policy exercises.

The notebooks are intended to be read and run selectively during or after the lecture. Large runtime artifacts, datasets, checkpoints, and generated outputs are intentionally not committed to this repository.

## Repository Structure

- `slides.qmd`: main Quarto slide deck file
- `slides.pdf`: rendered lecture PDF
- `custom.scss`: minimal academic Quarto/reveal.js theme for the slides
- `sections/`: modular slide sections included by `slides.qmd`
- `references.bib`: bibliography entries
- `assets/figures/`: diagrams, plots, and conceptual visuals used in the slides
- `assets/photos/`: photos, screenshots, and GIF examples used in the slides
- `assets/logos/`: institutional and project logos
- `assets/videos/`: video assets used in the slides
- `assets/prompts/`: visual prompt notes for future assets
- `scripts/`: helper scripts
- `handouts/`: optional teaching material

## For Contributors

Preview the slides locally with Quarto:

```bash
quarto preview slides.qmd
```

Render the reveal.js HTML slides:

```bash
quarto render slides.qmd --to revealjs
```

Render the lecture PDF:

```bash
scripts/render_pdf.sh
```

PowerPoint export is not a supported canonical output for this deck. The slides
use reveal.js-specific layout and `custom.scss`, which do not translate
faithfully with `quarto render slides.qmd --to pptx`.
