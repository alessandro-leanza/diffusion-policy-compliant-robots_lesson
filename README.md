# Diffusion Policy for Compliant Robots

This repository contains lecture material for a graduate-level robotics / machine learning lecture.

The topic is diffusion policies for compliant robots, connecting imitation learning, diffusion models, real-time robot control, and variable admittance/impedance control.

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

Used for: [Course name], [Program/University], [Academic year]

## Repository Structure

- `slides.qmd`: main Quarto slide deck file
- `sections/`: modular slide sections included by `slides.qmd`
- `references.bib`: bibliography entries
- `assets/images/`: image assets used in the slides
- `assets/videos/`: video assets used in the slides
- `figures/`: generated or exported figures
- `scripts/`: helper scripts
- `handouts/`: optional teaching material

## How to View the Slides

Preview the slides locally with Quarto:

```bash
quarto preview slides.qmd
```

Render the reveal.js HTML slides:

```bash
quarto render slides.qmd --to revealjs
```

Render a PowerPoint version:

```bash
quarto render slides.qmd --to pptx
```
