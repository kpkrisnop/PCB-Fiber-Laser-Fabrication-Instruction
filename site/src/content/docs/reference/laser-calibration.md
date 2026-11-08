---
title: Laser calibration
description: Find the pen settings for your laser and boards.
---

Run these once per laser, and again when the board or solder mask changes. Test files are in [`fiber_laser_calibration/test_files`](https://github.com/kpkrisnop/PCB-Fiber-Laser-Fabrication-Instruction/tree/main/fiber_laser_calibration/test_files).

## Copper → pen 0

1. Clean a board with IPA.
2. Put it on the bed and focus the laser.
3. Run the copper test.
4. Pick the square that removed the most copper. Save it as pen 0, `copper`.

## Solder mask → pens 1 and 2

1. Clean a board, paint the light layer, cure it, paint the dark layer, cure it.
2. Put it on the bed and focus the laser.
3. Run the tests one by one.
4. The square that removed **only the top layer** → pen 1, `silk`.
5. The square that removed **both layers** cleanly → pen 2, `mask`.

Paint thickness varies, so calibrate each side of the board.

## Black paper → pen 3

1. Draw a rectangle in BslAppSimple.
2. Put black paper on the bed and focus the laser.
3. Find the fastest setting that cuts through in one pass. KP's: 100 %, 100 mm/s, 30 kHz, 1 pass.
4. Save it as pen 3, `paper`.

:::caution
Watch for fire. Paper debris can catch.
:::

:::note[To write]
Say which test file is which (`freq-hatch`, `freq-power`, `speed-freq`), and add a drawing of a finished test board.
:::
