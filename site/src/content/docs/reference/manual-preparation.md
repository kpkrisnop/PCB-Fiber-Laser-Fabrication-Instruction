---
title: Manual preparation
description: Making the machine files by hand in FlatCAM and BslAppSimple, without an agent.
---

The [agent](/preparing/prepare-files/) does all of this. This page is the fallback, and a way to check what the agent made.

## Outline

1. FlatCAM: import the Gerbers and drill file.
2. Prepare `Edge_Cuts` and move the board to (10, 10).
3. Make the stock (outer) cutout and the four pin holes.
4. Make the copper isolation: 0.1 mm, 8 passes, 60 % overlap, combined.
5. Export the copper, mask and silk SVGs.
6. Make the drill and cutout G-code, and export it.
7. BslAppSimple: import the SVGs, hatch mask and silk, offset `outer` by −0.1 mm, assign pens 0–3, save.

:::note[To write]
The full click-by-click steps and screenshots are in the old README (section 6). Decide how much of that to keep.
:::
