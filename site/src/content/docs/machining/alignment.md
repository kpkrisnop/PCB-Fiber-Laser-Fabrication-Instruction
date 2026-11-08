---
title: Alignment
description: How the board lands in exactly the same place every time.
---

The board goes on and off the machines five times. Every layer has to land on top of the last one, so the board must go back in exactly the same place each time.

The trick is the **outer**: a blank cut to a known size, with four pin holes near its corners. The **laser** lines the board up by the outer's edges. The **CNC** lines it up by the pin holes.

## 1. Drill the pin holes · CNC

![The CNC drills four pin holes in the bare copper board](/diagrams/align-1-pins.svg)

Start with a bare copper board on the spoilboard, a sacrificial MDF board fixed to the CNC bed. Four 3D-printed clamps hold the copper down. Each clamp is a bar with a slot down the middle and a slanted face on one side. The slot lets it slide along the spoilboard until its lip sits on the copper.

The lip reaches only 2 mm over the edge. It presses less on the board, and the router can cut right up close to it.

The CNC drills four pin holes first, before anything is cut. Each hole sits 2 mm in from a corner of the outer, which is 3 mm outside the corner of the finished board. The holes go through the copper and into the spoilboard underneath.

Drill before cutting. A board that is already cut out can shift while it is drilled, and then the holes are off.

## 2. Cut the outer · CNC

![The CNC routes the outer; tabs keep it attached to the board](/diagrams/align-2-outer.svg)

The CNC routes around the outer. Small **tabs** on the top and bottom edges keep the outer attached to the rest of the board while it is cut. Now the outer has a known size, 40.5 × 108.5 mm for this board, and its pin holes are exactly where the CNC put them.

Take the board out, break the outer free and file off what is left of the tabs.

## 3. Cut the paper jig · Laser

![The laser cuts the outer's shape into black paper taped to the plate](/diagrams/align-3-jig-cut.svg)

Tape a sheet of black paper to the laser plate with blue tape. The laser cuts the outer's shape out of the paper with pen 3 `paper`. The hole in the paper is now exactly where the laser will mark.

## 4. Put the outer in the jig · Laser

![The outer drops into the cut-out in the paper](/diagrams/align-4-jig-fit.svg)

The outer drops into the hole with no wiggle. You can take it out and put it back without losing the position. **Don't move the paper** until both sides are done.

## 5. Pin the board to the CNC · CNC

![Back on the CNC, four pins go through the holes into the spoilboard](/diagrams/align-5-cnc-pins.svg)

For the last CNC step, four 0.8 mm pins go through the pin holes into the spoilboard, and the four clamps hold the board down again. With only 2 mm of lip on the edge, the clamps stay clear of the finished board. The board now sits exactly where the holes were drilled, so the drills and the board cutout line up with the copper.

### If the CNC loses its position

On a long job you may switch the motors off. The CNC then no longer knows where it is, and the pin holes in the spoilboard stop matching the machine.

To fix it, take the copper off the bed and run the same pin file again, starting from a new spot on the spoilboard. The CNC drills new holes that match its position. Pin the board into the new holes.

## Mark the board before painting

:::note[To draw]
The corner mark, and the flip.
:::

Once the solder mask is on, you can't see the copper any more. Before painting, mark one corner or one edge of the board. Without the mark, the mask and silkscreen can end up rotated against the copper underneath.

A symmetric board fits the jig any way round, so the mark is the only way to tell which way is right.

## Flipping to the other side

Flip the board and the job **the same way**. If you flip the job top to bottom in BslAppSimple, flip the board top to bottom in the jig. Left to right works too, as long as both match.
