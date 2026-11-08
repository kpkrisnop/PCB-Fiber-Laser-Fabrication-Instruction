---
title: Prepare the files
description: One request to the agent turns the Gerber folder into the machine files.
---

Give the agent the `gbr/` folder. It checks the design, then runs `pcb-cam`, which makes every machine file in a few seconds.

## 1. Check

1. **DRC.** The agent runs KiCad's design rules check and reports any errors. Fix them in KiCad and export again.
2. **FlatCAM preview.** Look at the board in FlatCAM before the files go to the machines. This is where a design that passed DRC but can't be made shows up.

## 2. Make the files

What `pcb-cam` does, in order:

1. Moves the board so its corner sits at (10, 10) on the machines.
2. Draws the copper isolation for the laser.
3. Rounds every hole to the nearest drill bit and puts all holes in one drill file.
4. Makes the CNC cuts: the board outline and the stock outline, with tabs that don't line up.
5. Adds four alignment pin holes, 3 mm outside the board corners.
6. Exports the copper, mask, silkscreen and jig outlines for the laser.

:::note[To write]
- How to ask the agent to run it.
- What to look for in the FlatCAM preview.
- Loading the laser layers into BslAppSimple (pens, hatching).
:::
