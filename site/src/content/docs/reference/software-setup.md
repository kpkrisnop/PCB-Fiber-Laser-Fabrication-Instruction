---
title: Software setup
description: One-time settings after installing.
---

## KiCad

Import KP's design rules into each project. See [Design rules](/designing/design-rules/).

## FlatCAM Evo

1. **Options › Tools Database › Import DB**, and pick the file in [`flatcam_tools_database`](https://github.com/kpkrisnop/PCB-Fiber-Laser-Fabrication-Instruction/tree/main/flatcam_tools_database).
2. Right-click the toolbar and turn on every tool.

The agent route sets every bit size, depth and feed itself, so it doesn't read the database. Import it for the [manual route](/reference/manual-preparation/) and for checking files by hand.

:::caution[Old database file]
The file was saved by FlatCAM 8.9, and Evo rejects every tool in it. In a copy, replace `"tools_mill_f_plunge": 0.0` with `"tools_mill_f_plunge": false`, then import the copy.
:::

## BslAppSimple

Save the four pens. See [Pen settings](/reference/pen-settings/).
