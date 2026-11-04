# KP's KiCad -> FlatCAM job. Expects GBR (folder), BASE (file prefix), OUT (folder) set before this runs.
# Settings copied from the Wooding Clock project / .tap files (Apr-May 2026).

proc f {suffix} { global GBR BASE; return [file join $GBR "$BASE-$suffix"] }

open_gerber [f Edge_Cuts.gbr] -outname edge
foreach L {F_Copper B_Copper F_Mask B_Mask F_Silkscreen B_Silkscreen} {
    if {[file exists [f $L.gbr]]} { open_gerber [f $L.gbr] -outname $L }
}
# The drill file pcb-cam rounded to bits and merged (see pcb-cam).
open_excellon [file join $OUT "$BASE-bits.drl"] -outname drl

# Edge_Cuts line width from its aperture (KiCad: 0.1 on older boards, 0.05 on newer); h = half of it.
set fh [open [f Edge_Cuts.gbr]]; regexp {%ADD\d+C,([0-9.]+)} [read $fh] -> ew; close $fh
set h [expr {$ew / 2.0}]
# Move the board so the Edge_Cuts line centre sits at (10,10). The bounds include half the line.
set b [lindex [get_bounds edge] 0]
set dx [expr {10.0 - ([lindex $b 0] + $h)}]
set dy [expr {10.0 - ([lindex $b 1] + $h)}]
offset {*}[get_names] -x $dx -y $dy
lassign [lindex [get_bounds edge] 0] x0 y0 x1 y1
# line-centre corners of the board
set x0 [expr {$x0+$h}]; set y0 [expr {$y0+$h}]; set x1 [expr {$x1-$h}]; set y1 [expr {$y1-$h}]

# Laser layers: copper isolation as SVG (0.1 spot, 8 passes, 60 % overlap, combined); mask and silk as-is.
foreach L {F_Copper B_Copper} {
    if {[lsearch [get_names] $L] < 0} continue
    isolate $L -dia 0.1 -passes 8 -overlap 60 -combine True -outname ${L}_iso
    export_svg ${L}_iso [file join $OUT "$BASE-${L}_iso.svg"]
}
foreach L {F_Mask B_Mask F_Silkscreen B_Silkscreen} {
    if {[lsearch [get_names] $L] >= 0} { export_svg $L [file join $OUT "$BASE-$L.svg"] }
}

# Drills: all tools in one file with tool changes.
drillcncjob drl -drillz -1.7 -travelz 2 -feedrate_z 200 -feedrate_rapid 1500 -endz 15 -toolchangez 15 -toolchange 1 -pp default -outname drl_cnc
write_gcode drl_cnc [file join $OUT "$BASE-drill.tap"]

# Board cutout: 2 mm end mill, path 0.1 from the KiCad line centre (margin counts from the line's outer edge), 2 x 1 mm deep.
set mill {-dia 2 -z_cut -2 -dpp 1 -z_move 2 -feedrate 600 -feedrate_z 120 -feedrate_rapid 1500 -endz 15 -pp default}
# Tabs: the edge cut has them on the left/right sides, the stock on top/bottom, so they never line up.
# Two per side once the side they sit on is longer than 80 mm, else one.
proc tabs {side len} { expr {$len > 80 ? "2$side" : $side} }
cutout edge -type any -dia 2 -margin [expr {0.1 - $h}] -gapsize 3 -gaps [tabs lr [expr {$y1-$y0}]] -outname edge_cutout
cncjob edge_cutout {*}$mill -outname edge_cnc
write_gcode edge_cnc [file join $OUT "$BASE-Edge_Cuts_cutout.tap"]

# Stock: rectangle 5 mm outside the board line centre with 1 mm corner fillets. Written as a Gerber
# (a region plus a 2 mm-wide outline, so it is solid with round corners): cutout on a Gerber offsets
# outward by the tool radius, so the stock itself keeps the 1 mm fillets (a Geometry is cut on the line).
set r 1.0
lassign [list [expr {$x0-5}] [expr {$y0-5}] [expr {$x1+5}] [expr {$y1+5}]] a b c d
proc gx {v} { return [expr {round($v * 1e6)}] }
set ia [expr {$a+$r}]; set ib [expr {$b+$r}]; set ic [expr {$c-$r}]; set id [expr {$d-$r}]
set ring "X[gx $ia]Y[gx $ib]D02*\nX[gx $ic]Y[gx $ib]D01*\nX[gx $ic]Y[gx $id]D01*\nX[gx $ia]Y[gx $id]D01*\nX[gx $ia]Y[gx $ib]D01*\n"
set fh [open [file join $OUT "$BASE-outer.gbr"] w]
puts -nonewline $fh "%FSLAX46Y46*%\n%MOMM*%\n%ADD10C,[expr {2*$r}]*%\n%LPD*%\nG01*\nG36*\n${ring}G37*\nD10*\n${ring}M02*\n"
close $fh
open_gerber [file join $OUT "$BASE-outer.gbr"] -outname outer
cutout outer -type any -dia 2 -margin 0 -gapsize 3 -gaps [tabs tb [expr {$c-$a}]] -outname outer_cutout
cncjob outer_cutout {*}$mill -outname outer_cnc
write_gcode outer_cnc [file join $OUT "$BASE-outer_cutout.tap"]
# The same stock outline as a laser layer (the paper jig), FlatCAM-style y-up SVG with 1 mm arcs.
set fh [open [file join $OUT "$BASE-outer.svg"] w]
set arc "A$r,$r 0 0 1"
puts $fh "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"[expr {$c-$a}]mm\" height=\"[expr {$d-$b}]mm\" viewBox=\"$a [expr {-$d}] [expr {$c-$a}] [expr {$d-$b}]\"><g transform=\"scale(1,-1)\"><path fill=\"none\" stroke=\"#66cc99\" stroke-width=\"0.02\" d=\"M$ia,$b L$ic,$b $arc $c,$ib L$c,$id $arc $ic,$d L$ia,$d $arc $a,$id L$a,$ib $arc $ia,$b Z\"/></g></svg>"
close $fh

# Alignment pins: 1 mm, 8 mm deep (into the spoilboard), 3 mm outside each board corner.
new_excellon pins
foreach {x y} [list [expr {$x0-3}] [expr {$y0-3}] [expr {$x1+3}] [expr {$y0-3}] [expr {$x1+3}] [expr {$y1+3}] [expr {$x0-3}] [expr {$y1+3}]] {
    add_drill pins -dia 1.0 -x $x -y $y
}
drillcncjob pins -drillz -8 -travelz 2 -feedrate_z 200 -feedrate_rapid 1500 -endz 15 -pp default -outname pins_cnc
write_gcode pins_cnc [file join $OUT "$BASE-pins.tap"]

save_project [file join $OUT "$BASE.FlatPrj"]
puts "PCB_CAM DONE line=$ew board(line centre)=$x0 $y0 $x1 $y1 size=[expr {$x1-$x0}] x [expr {$y1-$y0}]"
