---
title: Pen settings
description: The four laser pens and what each one is for.
---

| Pen | Name | Used for | Power | Speed | Frequency |
| --- | --- | --- | --- | --- | --- |
| 0 | copper | copper isolation, both sides | 100 % | 1000 mm/s | 20 kHz |
| 1 | silk | silkscreen (top paint layer only) | 50 % | 1000 mm/s | 40 kHz |
| 2 | mask | pads (both paint layers) | 50 % | 1000 mm/s | 40 kHz |
| 3 | paper | black paper jig | 100 % | 100 mm/s | 30 kHz |

These are KP's numbers from the [calibration test](/reference/laser-calibration/). Another laser or board may need different ones.

:::caution[Pen 0 shows 75 % and 30 kHz]
**Use Default Configs** is ticked on pen 0, so it ignores the copper settings. Untick it before etching copper.
:::