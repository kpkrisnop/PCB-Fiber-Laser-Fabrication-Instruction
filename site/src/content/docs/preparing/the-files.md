---
title: The files you get
description: What each output file is for, and which machine it goes to.
---

## CNC

| File | What it does | Step |
| --- | --- | --- |
| Pin holes G-code | Drills the four alignment holes | [1. CNC](/machining/1-cnc-pins-stock/) |
| Stock cutout G-code | Cuts the blank out of the sheet | [1. CNC](/machining/1-cnc-pins-stock/) |
| Drill G-code | Drills every hole, with a tool change per bit | [5. CNC](/machining/5-cnc-drill-cut/) |
| Board cutout G-code | Cuts the board out of the blank | [5. CNC](/machining/5-cnc-drill-cut/) |

## Laser

| Layer | Pen | What it does | Step |
| --- | --- | --- | --- |
| `outer` | 3 paper | Cuts the jig hole in black paper | [2. Laser](/machining/2-laser-jig-copper/) |
| `F_Copper`, `B_Copper` | 0 copper | Burns the copper away around the traces | [2. Laser](/machining/2-laser-jig-copper/) |
| `F_Mask`, `B_Mask` | 2 mask | Burns both paint layers off the pads | [4. Laser](/machining/4-laser-mask-silk/) |
| `F_Silkscreen`, `B_Silkscreen` | 1 silk | Burns the top paint layer so the light colour shows | [4. Laser](/machining/4-laser-mask-silk/) |

:::note[To write]
File names are going to change. Put the new names in these tables.
:::
