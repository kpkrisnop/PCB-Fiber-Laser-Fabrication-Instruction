# PCB Fiber Laser Fabrication Instruction

## 1. Overview

This document outlines the standard operating procedure (SOP) for fabricating 2 Layer Printed Circuit Boards (PCBs) using a fiber laser. This SOP will take you through the entire process in detail from file preparation to post-processing.

### Process Summary

The fabrication process involves the following key stages:

1.  **File Preparation**: Exporting Gerber files from KiCad and converting them into laser-ready vector formats (SVG) using FlatCAM.
2.  **Copper Etching**: Using the fiber laser to ablate unwanted copper, explicitly isolating the circuit traces.
3.  **Solder Mask & Silkscreen**: Applying a generic UV-curable solder mask paint over the entire board. After curing, the fiber laser is used to selectively remove (ablate) the paint from soldering pads, serving as a digital alternative to traditional photo-lithography.
4.  **CNC Router**: Drilling holes and cutting the board to shape.

### Prerequisites

- You have a PCB design in KiCad 9.0 that follows my design rules [KiCAD_Custom_DRC_Rules_for_KPPCB](KiCAD_Custom_DRC_Rules_for_KPPCB2).
- You have installed the required software. (e.g. KiCad 9.0, FlatCAM, BslAppSimple) If not see the installation guide at the end of this document.
- You know how to use Fiber Laser and basics of laser control software (BslAppSimple).
- You know how to use CNC Router and basics of CNC control software (Mach3).

### Reference Video

- [Homemade PCBs with Fiber Laser - 0.1mm Clearance (Electronoobs)](https://www.youtube.com/watch?v=PoYcjyghDx4)

## 2. Requirements

### Materials

- **PCB Material:** FR-1 PCB board. FR-4 will not work because the laser will burn the fiber glass content.
- **Solder Mask:** UV Curable Solder Mask. Get two colors if you are going to plot silkscreen layer.
  (e.g. green and white)
- **Thick Paper:** For aligning the PCB on the Fiber Laser bed
- **Fine Grid Sand Paper:** For cleaning the PCB
- **Cleaning Supplies:** Isopropyl alcohol (IPA), lint-free wipes

### Tools

- **Fiber Laser:** For etching copper and solder mask layer
- **CNC Router:** For cutting and drilling
- **UV Light Source:** For curing solder mask layer
- **Silkscreen Mesh:** For applying solder mask and silkscreen.

### Software (My case)

- **PCB Designing Software:** KiCad 9.0
- **CAM Software:** FlatCAM 8.9
- **Fiber Laser Software:** BslAppSimple 5.2
- **CNC Router Software:** Mach3

## 3. Laser Calibration Test

- **Copper Etching Test:**
  - **Preparation:**
    - Download the test file [Laser Calibration Test](fiber_laser_calibration/test_files).
    - Clean the PCB using IPA and lint-free wipes.
    - Place the PCB on the laser bed.
    - Adjust the focus of the laser.
    - Run the program.

  - **Observation:**
    - Look for the one that cleanly removes the copper layer, while not burning the PCB.
    - My personal settings: `Power: 100%`, `Speed: 1000mm/s`, `Frequency: 20kHz`

- **Solder Mask Etching:**
  - **Preparation:**
    - Download the test file [Laser Calibration Test](fiber_laser_calibration/test_files).
    - Clean the PCB using IPA and lint-free wipes.
    - Place the PCB on the laser bed.
    - Adjust the focus of the laser.
    - Run the programs one by one.

## 4.Workflow

After you have designed the PCB, you can start the workflow.

### 4.1 File Preparation

#### KiCad

Export the Gerber files from KiCad. Go to **File > Plot...** and fill in these settings:

<img src="images/kicad_plot.png" alt="KiCad Plot" width="720">

Select the layers according to the number of layers in your PCB design. If you have one layer PCB, you don't need to select the back layers. In this example, I make 2-layer PCB, so I select:

- Front
- Back
- F.Mask
- B.Mask
- F.SilkS
- B.SilkS
- Edge.Cuts

Then click **Plot**
Then click **Generate Drill Files...**
Fill in the following settings:

<img src="images/kicad_drill.png" alt="KiCad Drill" width="720">

Then click **Generate**

#### FlatCAM

**Run FlatCAM in Terminal**

```bash
flatcam
```

Go to **File > Open Gerber** and select the Gerber files you exported from KiCad.

<img src="images/flatcam_open_gerber.png" alt="FlatCAM Open Gerber" width="720">

Select all the gerber files and click **Open**. You will see them on the left panel and the canvas.

<img src="images/flatcam_gerber_files.png" alt="FlatCAM Gerber Files" width="720">

Do the following operations to these layers:

- **Front:** Create new geometry using **Isolate**. Set **Passes** to `5` and **Overlap** to `60.00%`. **Delete** the original gerber file.
- **Back:** Create new geometry using **Isolate**. Set **Passes** to `5` and **Overlap** to `60.00%`. **Delete** the original gerber file.

<img src="images/flatcam_isolate.gif" alt="FlatCAM Isolate" width="720">

- **F.Mask:** Leave as is.
- **B.Mask:** Leave as is.
- **F.SilkS:** Leave as is.
- **B.SilkS:** Leave as is.
- **Edge.Cuts:** Create new geometry using **Follow**. **Delete** the original gerber file.

<img src="images/flatcam_follow.gif" alt="FlatCAM Follow" width="720">

- **Drills:** Leave as is.

<span style="color: #9a9a9a;">Go to _File > Export > Export SVG_ and export the remaining gerber files and geometry as SVG manually one by one.</span>
**Or use this Script** to export all remaining files. (Recommended)
Go to **File > Scripting > New Script**. **Delete** all template code. **Paste** this code and hit **Run**

```tcl
set output_path {/path/to/your/output/folder} ;# <--- Change this

# This line strips any surrounding ' or " characters
set output_path [string trim $output_path {'"}]
file mkdir $output_path

set object_list [get_active]

foreach obj $object_list {
   set full_filename [file join $output_path "${obj}.svg"]

   if {[catch {export_svg $obj $full_filename} err]} {
      puts "Could not export $obj: $err"
   } else {
      puts "Successfully exported: $obj"
   }
}
```

<img src="images/flatcam_script.png" alt="FlatCAM" width="720">

<img src="images/flatcam_export.png" alt="FlatCAM" width="720">

_You can save it for future use._

#### BslAppSimple

Go to **File > Vector File** and import the SVG files one by one. Make sure to **Uncheck "Placed to center"** when open.

<img src="images/bslapp_vector_file.png" alt="BslAppSimple">

Then hatch the **F.Mask and B.Mask layers** using **Contour** pattern. And set **Type** to `Contour` and **Line** to `0.04mm`

<img src="images/bslapp_hatch.png" alt="BslAppSimple">

### 4.2 Laser Operation

Before you start, make sure you have calibrated the laser according to the calibration test you did in [Section 3](#3-laser-calibration-test). Also clean the PCB surface with IPA and lint-free wipes.

1. **Clean the PCB**
2. **Cut the `CNC.Cuts` layer with CNC Router**
3. **Clean the PCB**
4. **Position the PCB for the `F.Copper` layer**
5. **Etch the `F.Copper` layer with Fiber Laser**
6. **Position the PCB for the `B.Copper` layer**
7. **Etch the `B.Copper` layer with Fiber Laser**
8. **Clean the PCB**
9. **Apply Soldermask**
10. **Position the PCB for the `F.Mask` layer**
11. **Etch the `F.Silkscreen` layer with Fiber Laser**
12. **Etch the `F.Mask` layer with Fiber Laser**
13. **Position the PCB for the `B.Mask` layer**
14. **Etch the `B.Silkscreen` layer with Fiber Laser**
15. **Etch the `B.Mask` layer with Fiber Laser**

## Software Installation

### KiCad 9.0

- Website: [Open](https://www.kicad.org/)
- Windows: [Open Download Page](https://www.kicad.org/download/windows/)
- MacOS: [Open Download Page](https://www.kicad.org/download/macos/)

### FlatCAM

- Website: [Open](http://flatcam.org/download)
- Windows: [Open Download Page](https://bitbucket.org/jpcgt/flatcam/downloads/)
- MacOS: [Open Download Page](https://github.com/tomoyanonymous/homebrew-flatcam) _In MacOS, I experienced minor bugs in the program, specifically in `flatcam-evo`. Nevertheless, I quickly debugged using the error messages in the program and fixed these bugs using AI (e.g. Gemini, ChatGPT, Claude)._

### BslAppSimple

- Website: [Open](https://www.laserchina.com/bslapp/)
- Windows: [Open Download Page](https://www.laserchina.com/bslapp/)
