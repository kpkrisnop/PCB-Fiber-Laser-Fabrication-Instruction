---
status: proposed
---

# The guide becomes a Starlight docs site built around four main points

The README had grown into one long SOP that no longer matches the workflow, and it is hard to follow for its reader, KP's dad, who knows nothing about how the boards are made. Decided 2026-11-07/08 (KP): rebuild it as a Starlight docs site with the stock theme, no custom styling, and organise everything around four main points, read in order:

1. **Overview**: a process summary shown as an illustration, not a list, because the board goes back and forth between the laser and the CNC; the prerequisites (rewritten); and the reference video (kept).
2. **Designing**: KiCad, short and concise.
3. **Preparing (agent-driven)**: an AI agent prepares the machine files, so this part outlines the steps instead of documenting every FlatCAM click. It also needs new agent skills: one to prepare the files, and one to check the design in KiCad beyond what DRC passes. Tuning the custom DRC rules to the machine settings may cover part of that.
4. **Machining workflow**: the hard part and the core of the guide. It is split into small steps, and every step gets at least one illustration (photos to follow later).

Everything else, including safety, requirements, software installation, software setup, pen settings and laser calibration, moves to side pages that the four main points link to, so the main path stays focused on machining.

## Follow-up decisions (KP, 2026-11-08)

- **Who prepares the files:** KP usually does, and KP's dad usually only machines. The dad must still be able to run his own agent to prepare the files, so Preparing stays on the main path.
- **Illustrations** are accurate isometric or 2D views of the real setup, not abstract box diagrams.
- **The two agent skills** (prepare files, check design) live in this repo and must install easily on any machine.
- **The site** lives in this repo, in `site/`. Hosting is not decided; GitHub Pages is the likely choice.
- **Safety:** the full text goes on a side page. Every laser step gets a short "goggles on" warning that links to it.
- **Machining steps** are written last, after KP walks through the current order. The rest of the site is outlined first and then corrected detail by detail.

## Consequences

- The README's "Operation" section and its requirements list are stale and get rewritten, not ported. Requirements must add the CNC fixture and other missing tools.
- The detailed manual FlatCAM and BslAppSimple steps leave the main path.
- Output file names are expected to change later, so the docs should not depend on the current names.
