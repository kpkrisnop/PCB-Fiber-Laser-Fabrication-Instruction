// Drawings for the Alignment page, in the style of the anatomy skill.
// Run from site/:  node scripts/alignment_iso.mjs [1 2 3 4 5]     writes public/diagrams/align-*.svg
// Needs the anatomy skill's kit in ~/.claude/skills/anatomy.
// The CNC is KP's model from KP/Desktop_CNC_Illustration/build.mjs. World is mm, z up; the spindle
// axis is at y = 0 and the table slides in y. Board sizes are the Wooding Clock mini (pcb-cam geometry).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { homedir } from "node:os";

const SKILL = join(homedir(), ".claude/skills/anatomy");
const k = await import(pathToFileURL(join(SKILL, "kit/iso-kit.mjs")).href);
const G = await import(pathToFileURL(join(SKILL, "kit/lathe.mjs")).href);
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../public/diagrams");

const WIDTH = 1000, HEIGHT = 720;

// ---------- the board (pcb-cam geometry) ----------
const BOARD = [30.5, 98.5], STOCK_OUT = 5, PIN_IN = 2, T = 1.6, SHEET_W = 70, SHEET_D = 140, BIT = 2, TAB = 3;
const HOLE_R = 1.2; // ponytail: real holes are 0.8 mm; drawn bigger so they show
const SW = BOARD[0] + 2 * STOCK_OUT, SH = BOARD[1] + 2 * STOCK_OUT;
const OX = -SW / 2, OY = -SH / 2, SX = -SHEET_W / 2, SY = -SHEET_D / 2;
const PINS = [[OX + PIN_IN, OY + PIN_IN], [OX + SW - PIN_IN, OY + PIN_IN], [OX + SW - PIN_IN, OY + SH - PIN_IN], [OX + PIN_IN, OY + SH - PIN_IN]];

// ---------- the CNC's numbers ----------
const LEAD = 8;
const SPINDLE_T = 82; // height the spindle parts are modelled at; the Z stage shifts them down to the job
const BASE = { x: -245, y: -225, w: 490, d: 475, r: 10 };
const BASE_H = 36, FOOT_H = 14;
const TABLE = { x: -185, y: -100, w: 370, d: 200, r: 3 };
const TABLE_Z = 36, TABLE_TOP = 62;
const FIX_TOP = 70, WORK_TOP = FIX_TOP + T; // a spoilboard on the table, then the copper
const UP_Y = -190, UP_D = 140, UP_H = 300;
const BEAM = { x: -215, y: -150, w: 430, d: 60, r: 1.5 };
const BEAM_Z = 185, BEAM_TOP = 285;
const RAIL_Y = -90, SCREW_Y = -76, SCREW_Z = 235;
const CHAIN = { anchor: -186, slack: 336, radius: 16, z: 293, yNear: -109, yFar: -131, pitch: 10, height: 12 };
const M = { LEAD, CHAIN, WORK_TOP: SPINDLE_T };

let P; // the current frame's camera

const at = (p) => k.iso(p, P);
const project = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts.map(at), style);
const box = (x, y, w, d, z, h, style = { tone: "mid" }, r = 1, bevel = 0.4, steps = 3) => S(k.slabOf({ x, y, w, d, r }, z, h, P, steps, bevel), style);
const can = (x, y, r, z, h, style = { tone: "mid" }, steps = 36, bevel = 0) => S(k.cylinder(x, y, r, z, h, P, steps, bevel), style);
const poly = (pts) => k.pathOf(pts.map(at), true);
const faceX = (x, y0, y1, z0, z1) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);
const faceY = (y, x0, x1, z0, z1) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
const dark = (d) => `<path class="iso-shade" data-shade="0" d="${d}"/>`;
const closed = (d, tone = "lo") => L(d, { tone });
const seg = (a, b, tone = "faint") => L(k.segment(a, b, P), { tone });
const screwTop = (x, y, z, r = 2.4) => L(k.ring(x, y, r, z, P, 14), { tone: "lo" }) + D([[x, y, z]], { size: 0.5 });
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// A horizontal lead screw: one turned rod with a thread arc every lead.
function leadScrew(origin, axis, length, r) {
  const F = G.frameAlong(origin, axis);
  let arcs = "";
  for (let s = 4; s < length; s += M.LEAD) arcs += G.arcOf(F, s, r, P);
  return S(G.solidOf([[0, r], [length, r]], F, P), { tone: "mid", crease: "none", inner: L(arcs, { tone: "lo" }) });
}

// NEMA 17 body whose shaft runs along +x or +y: front cap, laminated stack, rear cap, connector.
function motorAlong(axis, s0, cross, zc, half = 21) {
  const zb = zc - half, h = half * 2;
  const band = (s, len, inset, tone) => axis === "x"
    ? box(s, cross - half + inset, len, h - inset * 2, zb + inset, h - inset * 2, { tone }, 4, 0.6, 3)
    : box(cross - half + inset, s, h - inset * 2, len, zb + inset, h - inset * 2, { tone }, 4, 0.6, 3);
  const ribs = [];
  const stack0 = s0 + 7, stack1 = s0 + 35;
  for (let s = stack0 + 3.5; s < stack1; s += 3.5) {
    const z = zb + 1.2, top = zb + h - 1.2;
    if (axis === "x") ribs.push(seg([s, cross + half - 1.2, z], [s, cross + half - 1.2, top], "lo") + seg([s, cross - half + 1.2, top], [s, cross + half - 1.2, top], "lo"));
    else ribs.push(seg([cross + half - 1.2, s, z], [cross + half - 1.2, s, top], "lo") + seg([cross - half + 1.2, s, top], [cross + half - 1.2, s, top], "lo"));
  }
  const corners = (s) => axis === "x"
    ? [[s, cross - half + 4, zb + h], [s, cross + half - 4, zb + h]]
    : [[cross - half + 4, s, zb + h], [cross + half - 4, s, zb + h]];
  return band(s0, 7, 0, "mid") + band(stack0, 28, 1.2, "mid") + ribs.join("") + band(stack1, 8, 0, "mid") + D([...corners(s0 + 3.5), ...corners(stack1 + 4.5)], { size: 0.5 });
}

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 34))) {
    out.push(can(x, y, 20, -BASE_H - FOOT_H, 4, { tone: "lo" }, 36));
    out.push(can(x, y, 15, -BASE_H - FOOT_H + 4, FOOT_H - 4, { tone: "mid" }, 36));
  }
  const seam = k.sideSeam(BASE, -11, P, 8);
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.4), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
  // Bolts along the seam on the two visible faces.
  const fx = []; for (let y = -190; y <= 215; y += 45) fx.push([BASE.x + BASE.w, y, -24]);
  const fy = []; for (let x = -210; x <= 210; x += 42) fy.push([x, BASE.y + BASE.d, -24]);
  out.push(D([...fx, ...fy], { size: 0.55 }));
  // Name plate on the front face.
  const fy0 = BASE.y + BASE.d;
  out.push(closed(faceY(fy0, 120, 205, -9, -2.4), "lo"));
  // Top-face groove, corner bolts.
  out.push(L(k.planOutline(k.insetPlan(BASE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(BASE, 16);
  out.push(screws.map(([x, y]) => screwTop(x, y, 0, 3.4)).join(""));
  // Y scale, read by the pointer on the table.
  const strip = { x: 190, y: -110, w: 10, d: 220, r: 0.6 };
  out.push(S(k.slabOf(strip, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(-100, 100, 10, 5, 190.5, 0.8, [3.4, 6.4], P, "y");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // Chip tray between the Y rails, with closed drain slots along its front.
  const tray = { x: -102, y: -200, w: 204, d: 396, r: 3 };
  out.push(L(k.planOutline(tray, 0, P, 3), { tone: "lo" }));
  for (let x = -90; x <= 74; x += 20) {
    if (x < -36 || x > 20) out.push(closed(k.planOutline({ x, y: 150, w: 14, d: 34, r: 3 }, 0, P, 3), "faint"));
  }
  return out.join("");
}

function upright(x) {
  const out = [];
  out.push(box(x - 6, UP_Y - 8, 42, UP_D + 16, 0, 12, { tone: "mid" }, 3, 0.8));
  const nx = x + 30, plan = { x, y: UP_Y, w: 30, d: UP_D, r: 2.5 };
  const seam = k.sideSeam(plan, 22, P, 4) + k.sideSeam(plan, UP_H - 22, P, 4);
  out.push(S(k.slabOf(plan, 12, UP_H - 12, P, 4, 1), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
  out.push(box(x - 3, UP_Y - 3, 36, UP_D + 6, UP_H, 8, { tone: "mid" }, 3, 0.8));
  out.push(screwTop(x + 15, UP_Y + 16, UP_H + 8), screwTop(x + 15, UP_Y + UP_D - 16, UP_H + 8));
  // Beam bolts and closed vent slots on the face toward +x, foot bolts, and a slotted inspection
  // panel on the front face. The far upright shows the same faces, so it gets the same parts.
  const fy = UP_Y + UP_D;
  out.push(D([[nx, -140, 200], [nx, -100, 200], [nx, -140, 270], [nx, -100, 270]], { size: 0.6 }));
  for (let z = 62; z <= 152; z += 15) out.push(closed(faceX(nx, UP_Y + 34, fy - 34, z, z + 5), "lo"));
  out.push(D([[nx + 3, UP_Y + 10, 12], [nx + 3, fy - 10, 12]], { size: 0.6 }));
  out.push(closed(faceY(fy, x + 6, x + 24, 44, 164), "lo"));
  for (let z = 56; z <= 148; z += 18) out.push(closed(faceY(fy, x + 10, x + 20, z, z + 8), "faint"));
  out.push(D([[x + 15, fy, 36], [x + 15, fy, 172], [x + 15, fy, 268]], { size: 0.6 }));
  return out.join("");
}

function yDrive() {
  const out = [];
  out.push(box(-16, -213, 32, 10, 0, 36, { tone: "mid" }, 2, 0.6));
  out.push(screwTop(-9, -208, 36, 2), screwTop(9, -208, 36, 2));
  for (const x of [-120, 120]) {
    out.push(box(x - 8, -190, 16, 380, 0, 12, { tone: "mid" }, 1, 0.4));
    out.push(L(k.lineOnTop([x, -190], [x, 190], 12, P), { tone: "faint" }));
    const bolts = []; for (let y = -180; y <= 180; y += 30) bolts.push([x, y, 12]);
    out.push(D(bolts, { size: 0.5, tone: "lo" }));
  }
  out.push(leadScrew([0, -203, 22], [0, 1, 0], 401, 4.5));
  out.push(box(-30, 198, 60, 6, 0, 54, { tone: "mid" }, 2, 0.6));
  out.push(D([[-23, 204, 8], [23, 204, 8], [-23, 204, 46], [23, 204, 46]], { size: 0.55 }));
  return out.join("");
}

function table(work) {
  const out = [];
  for (const [x, y] of byDepth([[-120, -65], [120, -65], [-120, 65], [120, 65]])) {
    out.push(box(x - 14, y - 22, 28, 44, 12, 24, { tone: "mid" }, 2, 0.6));
  }
  out.push(box(-18, -16, 36, 32, 13, 23, { tone: "mid" }, 2, 0.6));
  const seam = k.sideSeam(TABLE, 44, P, 4);
  out.push(S(k.slabOf(TABLE, TABLE_Z, TABLE_TOP - TABLE_Z, P, 4, 0.8), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
  // T-slots, cut across the full width and open on the near end.
  const slots = [-80, -40, 0, 40, 80];
  for (const y of slots) {
    const plan = { x: TABLE.x + 0.6, y: y - 4, w: TABLE.w - 1.2, d: 8, r: 0 };
    out.push(dark(k.planOutline(plan, TABLE_TOP, P, 1)));
    out.push(closed(k.planOutline(plan, TABLE_TOP, P, 1), "lo"));
    out.push(dark(faceX(TABLE.x + TABLE.w, y - 4, y + 4, TABLE_TOP - 11, TABLE_TOP)));
    out.push(closed(faceX(TABLE.x + TABLE.w, y - 4, y + 4, TABLE_TOP - 11, TABLE_TOP), "lo"));
  }
  const between = [-60, -20, 20, 60];
  const bolts = [];
  for (const y of between) for (const x of [-172, 172]) bolts.push([x, y]);
  out.push(bolts.map(([x, y]) => screwTop(x, y, TABLE_TOP, 2.6)).join(""));
  // Finger that hangs off the table and reads the Y scale at its own height.
  out.push(box(185, -9, 3, 18, 3, 54, { tone: "mid" }, 0.6, 0));
  out.push(D([[188, -5, 50], [188, 5, 50]], { size: 0.5 }));
  out.push(box(188, -1.2, 10.5, 2.4, 3, 1.6, { tone: "hi", crease: "lo" }, 0.4, 0));
  out.push(work());
  return out.join("");
}

function beam() {
  const out = [];
  const seam = (z) => seg([BEAM.x, BEAM.y + BEAM.d, z], [BEAM.x + BEAM.w, BEAM.y + BEAM.d, z], "faint");
  out.push(S(k.slabOf(BEAM, BEAM_Z, BEAM_TOP - BEAM_Z, P, 3, 0.6), { tone: "mid", inner: seam(238) + seam(232) }));
  for (const y of [-142, -103]) out.push(L(k.lineOnTop([BEAM.x, y], [BEAM.x + BEAM.w, y], BEAM_TOP, P), { tone: "faint" }));
  // Rails on the front face, screws along them, X scale along the top edge.
  for (const z of [262, 192]) {
    out.push(box(-205, RAIL_Y, 410, 6, z, 16, { tone: "mid" }, 0.8, 0.4));
    const bolts = []; for (let x = -195; x <= 195; x += 30) bolts.push([x, RAIL_Y + 6, z + 8]);
    out.push(D(bolts, { size: 0.5, tone: "lo" }));
  }
  const strip = { x: -150, y: -96, w: 300, d: 5, r: 0.5 };
  out.push(S(k.slabOf(strip, BEAM_TOP, 0.6, P, 2), { tone: "lo", crease: "none" }));
  const t = k.topTicks(-150, 150, 10, 5, -91.5, BEAM_TOP + 0.6, [2.2, 3.8], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // X lead screw between two pillow blocks.
  out.push(box(-212, -90, 12, 24, 224, 22, { tone: "mid" }, 2, 0.6), D([[-206, -66, 240], [-206, -66, 230]], { size: 0.5 }));
  out.push(leadScrew([-200, SCREW_Y, SCREW_Z], [1, 0, 0], 400, 4));
  out.push(box(200, -90, 12, 24, 224, 22, { tone: "mid" }, 2, 0.6), D([[206, -66, 240], [206, -66, 230]], { size: 0.5 }));
  // Chain tray and fixed anchor.
  out.push(box(-200, M.CHAIN.yFar - 2, 370, 26, BEAM_TOP, 2, { tone: "lo", crease: "none" }, 0.8, 0));
  out.push(box(-200, M.CHAIN.yFar - 1, 14, 24, BEAM_TOP + 2, 12, { tone: "mid" }, 1, 0.5), screwTop(-193, -120, BEAM_TOP + 14, 2));
  return out.join("");
}

function chainSvg(shape) {
  const layer = (name) => `<g data-chain="${name}"><path class="iso-fill" d="${shape[name].edge}"/><path class="iso-top" d="${shape[name].top}"/><path class="iso-shade" data-shade="2" d="${shape[name].side}"/><path class="iso-line" data-tone="lo" d="${shape[name].edge}"/></g>`;
  return `<g data-part="chain">${layer("lower")}${layer("loop")}${layer("upper")}</g>`;
}

function spindle() {
  const T = M.WORK_TOP;
  const out = [];
  out.push(box(-50, -40, 100, 8, 130, 110, { tone: "mid" }, 2, 0.6));
  out.push(D([[-43, -32, 136], [43, -32, 136], [-43, -32, 234], [43, -32, 234]], { size: 0.6 }));
  // Endmill is the one lit part: everything else exists to put this point in the right place.
  out.push(can(0, 0, 1.0, T - 1.5, 26.5, { tone: "hi", crease: "none", lit: true }, 14));
  out.push(can(0, 0, 3.4, T + 25, 2, { tone: "mid", crease: "none" }, 16));
  out.push(can(0, 0, 10, T + 27, 9, { tone: "mid" }, 6, 0.6));
  out.push(can(0, 0, 15, T + 36, 7, { tone: "hi", crease: "lo" }, 44, 0.8));
  const sp = (z, h) => can(0, 0, 26, z, h, { tone: "hi", crease: "none" }, 72);
  const fins = (from, to) => { let d = ""; for (let z = from; z < to; z += 5) d += k.sideArc(0, 0, 26, z, P, 44); return L(d, { tone: "lo" }); };
  const clamp = (z, h) => {
    const plan = { x: -36, y: -32, w: 72, d: 68, r: 7 };
    return S(k.slabOf(plan, z, h, P, 8, 0.8), { tone: "mid", inner: L(k.sideSeam(plan, z + h / 2, P, 8), { tone: "faint" }) })
      + L(k.ring(0, 0, 27.4, z + h, P, 72), { tone: "lo" })
      + screwTop(-29, 26, z + h, 2) + screwTop(29, 26, z + h, 2) + screwTop(-29, -24, z + h, 2) + screwTop(29, -24, z + h, 2);
  };
  out.push(sp(T + 43, 13), clamp(T + 56, 20));
  out.push(sp(T + 76, 47), fins(T + 83, T + 121), clamp(T + 123, 20));
  out.push(sp(T + 143, 12), fins(T + 148, T + 155));
  out.push(can(0, 0, 22, T + 155, 8, { tone: "hi", crease: "lo" }, 60, 0.8));
  out.push(can(0, 0, 6, T + 163, 8, { tone: "mid" }, 24));
  out.push(L(k.ring(0, 0, 1.4, T + 171, P, 12), { tone: "mid" }));
  return out.join("");
}

function zStage() {
  const out = [];
  for (const x of [-35, 35]) for (const z of [150, 195]) out.push(box(x - 14, -52, 28, 12, z, 30, { tone: "mid" }, 2, 0.5));
  out.push(spindle());
  return out.join("");
}

function carriage() {
  const before = [];
  for (const x of [-35, 35]) for (const z of [188, 258]) before.push(box(x - 20, -84, 40, 14, z, 24, { tone: "mid" }, 2, 0.5));
  before.push(box(-55, -70, 110, 10, 165, 131, { tone: "mid" }, 2, 0.8));
  before.push(D([[-49, -60, 172], [49, -60, 172], [-49, -60, 289], [49, -60, 289]], { size: 0.6 }));
  for (const x of [-35, 35]) {
    before.push(box(x - 7, -60, 14, 8, 172, 118, { tone: "mid" }, 0.8, 0.4));
    const bolts = []; for (let z = 180; z <= 284; z += 26) bolts.push([x, -52, z]);
    before.push(D(bolts, { size: 0.45, tone: "lo" }));
  }
  // Z screw, visible above the moving plate.
  let threads = ""; for (let z = 168; z < 286; z += M.LEAD) threads += k.sideArc(0, -50, 4, z, P, 16);
  before.push(can(0, -50, 4, 165, 121, { tone: "mid", crease: "none" }, 18), L(threads, { tone: "lo" }));
  const after = [];
  after.push(can(0, -50, 11, 286, 10, { tone: "mid" }, 28));
  after.push(box(-55, -70, 110, 48, 296, 6, { tone: "mid" }, 2, 0.8));
  after.push(screwTop(-47, -62, 302), screwTop(47, -62, 302), screwTop(-47, -30, 302), screwTop(47, -30, 302));
  // Z motor, standing on the plate.
  after.push(box(-21, -71, 42, 42, 306, 7, { tone: "mid" }, 4, 0.6));
  after.push(box(-19.8, -69.8, 39.6, 39.6, 313, 28, { tone: "mid", inner: L([316.5, 320, 323.5, 327, 330.5, 334, 337.5].map((z) => k.sideSeam({ x: -19.8, y: -69.8, w: 39.6, d: 39.6, r: 4 }, z, P, 3)).join(""), { tone: "lo" }) }, 4, 0.6));
  after.push(box(-21, -71, 42, 42, 341, 9, { tone: "mid" }, 4, 0.6));
  after.push(screwTop(-16, -66, 350, 1.8), screwTop(16, -66, 350, 1.8), screwTop(-16, -34, 350, 1.8), screwTop(16, -34, 350, 1.8));
  after.push(box(-7, -29, 14, 4, 342, 7, { tone: "mid" }, 0.6, 0));
  // Post and arm that carry the moving end of the chain and the spindle's cable.
  after.push(box(-45, -68, 15, 12, 302, 30, { tone: "mid" }, 1, 0.5));
  after.push(box(-44, M.CHAIN.yFar, 14, 22, 317, 15, { tone: "mid" }, 1, 0.5));
  after.push(box(-45, -132, 15, 76, 332, 4, { tone: "mid" }, 1, 0.5));
  after.push(screwTop(-37.5, -120, 336, 2), screwTop(-37.5, -62, 336, 2));
  return { before: before.join(""), after: after.join("") };
}

function controlBox() {
  const out = [];
  const plan = { x: 204, y: 70, w: 36, d: 165, r: 3 };
  out.push(S(k.slabOf(plan, 0, 50, P, 4, 1), { tone: "mid", inner: L(k.sideSeam(plan, 8, P, 4), { tone: "faint" }) }));
  for (let y = 86; y <= 212; y += 21) out.push(closed(faceX(240, y, y + 13, 22, 26), "lo"));
  out.push(closed(faceY(235, 212, 224, 22, 30), "lo"), D([[218, 235, 26]], { size: 0.55 }));
  // Status screen, recessed.
  const screen = { x: 212, y: 92, w: 20, d: 62, r: 1 };
  out.push(dark(k.planOutline(screen, 50, P, 2)), closed(k.planOutline(screen, 50, P, 2), "mid"));
  const rules = [[218, 148, 116], [222, 148, 128], [226, 148, 104]];
  out.push(rules.map(([x, a, b]) => L(k.lineOnTop([x, a], [x, b], 50, P), { tone: "faint", free: true })).join(""));
  // Spindle knob and emergency stop.
  out.push(can(222, 174, 9, 50, 6, { tone: "mid" }, 32), L(k.knurl(222, 174, 9, 50, 56, 30, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([222, 174], [222, 181], 56, P), { tone: "hi" }), D([[222, 174, 56]], { size: 0.5, tone: "hi" }));
  out.push(can(222, 208, 10, 50, 4, { tone: "mid" }, 32));
  out.push(can(222, 208, 7.4, 54, 5, { tone: "mid", crease: "none" }, 28));
  out.push(can(222, 208, 11, 59, 5, { tone: "hi", crease: "lo" }, 36, 1));
  for (const [x, y] of [[209, 76], [235, 76], [209, 229], [235, 229]]) out.push(screwTop(x, y, 50, 1.8));
  return out.join("");
}

// Motor leads: stroked cables that start and end on real connectors.
const lead = (legs) => {
  const pts = [legs[0]];
  for (let i = 1; i < legs.length - 1; i++) {
    const [a, b, c] = [legs[i - 1], legs[i], legs[i + 1]];
    const r = Math.min(10, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / 2, Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]) / 2);
    const toward = (p) => { const l = Math.hypot(p[0] - b[0], p[1] - b[1], p[2] - b[2]); return b.map((v, n) => v + ((p[n] - v) * r) / l); };
    const f = toward(a), t = toward(c);
    for (let u = 0; u <= 1.001; u += 0.2) pts.push(f.map((v, n) => (1 - u) * (1 - u) * v + 2 * u * (1 - u) * b[n] + u * u * t[n]));
  }
  pts.push(legs[legs.length - 1]);
  return `<path class="iso-line cnc-cable" data-tone="mid" d="${k.pathOf(pts.map(at))}"/>` + D([legs[0], legs[legs.length - 1]], { size: 1, tone: "mid" });
};

function chainOf(carriageX, project) {
  const { anchor, slack, radius, z, yNear, yFar, pitch, height } = CHAIN;
  const end = carriageX - 30;
  const loopX = (anchor + end) / 2 + slack / 2;
  const lower = loopX - anchor, upper = loopX - end, arc = Math.PI * radius;
  const total = lower + arc + upper;
  const count = Math.round(total / pitch);
  const step = total / count;
  const out = { lower: { top: "", side: "", edge: "" }, loop: { top: "", side: "", edge: "" }, upper: { top: "", side: "", edge: "" } };
  const pt = (x, y, zz) => project([x, y, zz]).map((v) => v.toFixed(1)).join(" ");
  const quad = (list) => "M" + list.join("L") + "Z";
  for (let i = 0; i < count; i++) {
    const s = (i + 0.5) * step;
    // (nx, nz) is always the link's outer face. Round the loop each link is a wedge, wider at
    // the outside, so the links close up the way a real chain's do.
    let cx, cz, tx, tz, nx = 0, nz = 1, name, wide = 1, narrow = 1;
    if (s < lower) { cx = anchor + s; cz = z; tx = 1; tz = 0; name = "lower"; }
    else if (s < lower + arc) {
      const a = (s - lower) / radius;
      cx = loopX + radius * Math.sin(a); cz = z + radius * (1 - Math.cos(a)); tx = Math.cos(a); tz = Math.sin(a);
      nx = Math.sin(a); nz = -Math.cos(a); name = "loop";
      wide = (radius + height / 2) / radius; narrow = (radius - height / 2) / radius;
    } else { cx = loopX - (s - lower - arc); cz = z + radius * 2; tx = -1; tz = 0; name = "upper"; }
    const half = step * 0.44, h = height / 2;
    const c = (u, v, y) => pt(cx + tx * u + nx * v, y, cz + tz * u + nz * v);
    const side = quad([c(-half * wide, h, yNear), c(half * wide, h, yNear), c(half * narrow, -h, yNear), c(-half * narrow, -h, yNear)]);
    out[name].side += side;
    out[name].edge += side;
    if (nx * 0.61 + nz * 0.5 > 0) { // the outer face only shows when it turns toward the camera
      const top = quad([c(-half * wide, h, yFar), c(half * wide, h, yFar), c(half * wide, h, yNear), c(-half * wide, h, yNear)]);
      out[name].top += top;
      out[name].edge += top;
    }
  }
  return out;}

function cableOf(z, project) {
  const legs = [[-37.5, -62, 338], [-37.5, -44, 338], [-66, -44, 326], [-66, -6, 300 + z * 0.55], [-30, 8, 276 + z * 0.8], [0, 0, 253 + z]];
  const pts = [legs[0]];
  for (let i = 1; i < legs.length - 1; i++) {
    const [a, b, c] = [legs[i - 1], legs[i], legs[i + 1]];
    const from = b.map((v, n) => v + (a[n] - v) * 0.45), to = b.map((v, n) => v + (c[n] - v) * 0.45);
    for (let u = 0; u <= 1.0001; u += 0.1) {
      pts.push(from.map((v, n) => (1 - u) * (1 - u) * v + 2 * u * (1 - u) * b[n] + u * u * to[n]));
    }
  }
  pts.push(legs[legs.length - 1]);
  return "M" + pts.map((p) => project(p).map((v) => v.toFixed(1)).join(" ")).join("L");
}


// ---------- colour for the things that really have a colour ----------
const CSS = `<style>
.iso[data-theme="light"]{--anatomy-lo:#a2a2a7;--anatomy-mid:#737378;--anatomy-faint:#c9c9cc;--anatomy-weight:.75px}
.cnc-cable{stroke-width:1.5;stroke-linejoin:round}
.pcb-hole{fill:#2b2b2e;stroke:none}
.pcb-dark>.iso-fill,.pcb-dark>.iso-top{fill:#3a3a3e}.pcb-dark>.iso-shade{fill:#26262a}
.pcb-copper>.iso-fill,.pcb-copper>.iso-top{fill:#d9975a}
.pcb-copper>.iso-shade[data-shade="0"]{fill:#8f5a2b}.pcb-copper>.iso-shade[data-shade="1"]{fill:#a2682f}
.pcb-copper>.iso-shade[data-shade="2"]{fill:#b57639}.pcb-copper>.iso-shade[data-shade="3"]{fill:#c58446}
.pcb-copper>.iso-edge{stroke:#6d4420}
.pcb-paper{fill:#222225;stroke:#0e0e10;stroke-width:.75px;fill-rule:evenodd}
.pcb-tape>.iso-fill,.pcb-tape>.iso-top{fill:#4a86e0}.pcb-tape>.iso-shade{fill:#2f64b4}.pcb-tape>.iso-edge{stroke:#234c8c}
.pcb-beam-glow{stroke:#ff3b30;stroke-width:7px;opacity:.22;fill:none;stroke-linecap:round}
.pcb-beam{stroke:#f0281c;stroke-width:2px;fill:none;stroke-linecap:round}
.pcb-spot{fill:#fff;stroke:#f0281c;stroke-width:1.5px}
.pcb-cut{stroke:#ffb48f;stroke-width:1.8px;fill:none;stroke-linecap:round;stroke-linejoin:round}
.pcb-todo{stroke:#e9e4d8;stroke-width:1.3px;stroke-dasharray:6 5;fill:none}
.pcb-clamp .iso-fill,.pcb-clamp .iso-top{fill:#c7cbd2}.pcb-clamp .iso-shade[data-shade="1"]{fill:#9aa0a9}.pcb-clamp .iso-shade[data-shade="2"]{fill:#b3b8c1}.pcb-clamp .iso-shade[data-shade="3"]{fill:#a8adb6}
.pcb-mark{stroke:#5c3a1c;stroke-width:1.3px;stroke-dasharray:6 4;fill:none}
.pcb-drop{stroke:#55585e;stroke-width:1.2px;stroke-dasharray:4 4;fill:none}
.pcb-lead{stroke:#55585e;stroke-width:1.2px;fill:none}
.pcb-ring{stroke:#55585e;stroke-width:1.4px;fill:none}
.pcb-label{font:500 19px -apple-system,"Segoe UI",sans-serif;fill:#1d1e21;stroke:#fbfbfa;stroke-width:5px;paint-order:stroke;stroke-linejoin:round}
</style>`;

const hole = (x, y, z, r = HOLE_R) => `<path class="pcb-hole" d="${k.ring(x, y, r, z, P, 20)}"/>` + L(k.ring(x, y, r, z, P, 20), { tone: "mid" });
const copper = (plan, z, h) => S(k.slabOf(plan, z, h, P, 2, 0), { tone: "hi", crease: "none", className: "pcb-copper" });
const rect = (x, y, w, d, z) => { const pl = { x, y, w, d, r: 0 }; return `<path class="pcb-hole" d="${k.planOutline(pl, z, P, 1)}"/>`; };
const SHEET = { x: SX, y: SY, w: SHEET_W, d: SHEET_D, r: 0.4 };
const OUTER = { x: OX, y: OY, w: SW, d: SH, r: 1 }; // pcb-cam: 1 mm corner fillets

// The routed groove, just outside the outer, with a tab in the middle of the top and bottom edges.
function groove(z) {
  const x0 = OX - BIT, x1 = OX + SW, y0 = OY - BIT, y1 = OY + SH, len = SH + 2 * BIT, half = SW / 2 - TAB / 2;
  const parts = [rect(x0, y0, BIT, len, z), rect(x1, y0, BIT, len, z)];
  for (const y of [y0, y1]) parts.push(rect(OX, y, half, BIT, z), rect(TAB / 2, y, half, BIT, z));
  return parts.join("");
}

// The spoilboard on the table: pcb-cam drills the pin holes 8 mm deep, through the board into this.
function spoilboard() {
  const plan = { x: -112, y: -92, w: 224, d: 184, r: 1 };
  const screws = k.corners(plan, 7);
  return S(k.slabOf(plan, TABLE_TOP, FIX_TOP - TABLE_TOP, P, 3, 0.4), { tone: "mid" }) + screws.map(([x, y]) => screwTop(x, y, FIX_TOP, 2)).join("");
}

// A 3D-printed clamp: a rectangular bar with a slot down the middle and a slanted end. The slot lets it
// slide on the MDF until its lip sits over the copper. The lip reaches only 2 mm over the edge, so it presses
// less on the board and the router can run close to it. dir = -1 comes in from the left; half is the copper's half-width.
const CLAMP = { w: 16, len: 62, lip: 2, h: 8, slant: 16, nose: 2 };
function clamp(yc, dir, half) {
  const { w, len, lip, h, slant, nose } = CLAMP;
  const tip = half - lip;
  const y0 = yc - w / 2, y1 = yc + w / 2, top = WORK_TOP + h, X = (u) => dir * (tip + u); // u = distance back from the tip
  const edge = lip;
  const profile = [[0, WORK_TOP], [0, WORK_TOP + nose], [slant, top], [len, top], [len, FIX_TOP], [edge, FIX_TOP], [edge, WORK_TOP]];
  const { sinA, cosA, sinE, cosE } = k.cameraOf(P);
  const view = [cosA * cosE, sinA * cosE, sinE];
  const out = [];
  // Side wall facing the camera, then the ends and the top faces.
  const side = profile.map(([u, z]) => [X(u), y1, z]);
  const quads = [[0, 1, 3], [1, 2, 2], [2, 3, "top"]].map(([i, j, shade]) => {
    const [ua, za] = profile[i], [ub, zb] = profile[j];
    return { pts: [[X(ua), y0, za], [X(ub), y0, zb], [X(ub), y1, zb], [X(ua), y1, za]], shade };
  });
  const tail = { pts: [[X(len), y0, top], [X(len), y1, top], [X(len), y1, FIX_TOP], [X(len), y0, FIX_TOP]], shade: 3 };
  const dot = (f) => { const a = f.pts[0], b = f.pts[1], c = f.pts[2]; const e1 = b.map((v, i) => v - a[i]), e2 = c.map((v, i) => v - a[i]); const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; const centre = [dir * (tip + len / 2), yc, WORK_TOP + h / 2]; const m = a.map((v, i) => (a[i] + c[i]) / 2 - centre[i]); const flip = n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0 ? -1 : 1; return flip * (n[0] * view[0] + n[1] * view[1] + n[2] * view[2]); };
  const paint = (pts, shade) => {
    const d = k.pathOf(pts.map(at), true);
    const fill = shade === "top" ? `<path class="iso-top" d="${d}"/>` : `<path class="iso-shade" data-shade="${shade}" d="${d}"/>`;
    return `<path class="iso-fill" d="${d}"/>` + fill + `<path class="iso-line" data-tone="hi" d="${d}"/>`;
  };
  out.push(paint(side, 1));
  for (const f of [...quads, tail]) if (dot(f) > 0) out.push(paint(f.pts, f.shade));
  // The slot on the flat top, and the screw that rides in it.
  const a = Math.min(X(slant + 5), X(len - 6)), b = Math.max(X(slant + 5), X(len - 6));
  const slot = { x: a, y: yc - 3, w: b - a, d: 6, r: 3 };
  out.push(`<path class="pcb-hole" d="${k.planOutline(slot, top, P, 5)}"/>`, L(k.planOutline(slot, top, P, 5), { tone: "hi" }));
  const sx = X(len * 0.62);
  out.push(can(sx, yc, 7, top, 1, { tone: "mid" }, 22), can(sx, yc, 4.4, top + 1, 4, { tone: "mid" }, 6, 0.3));
  return `<g class="iso-solid pcb-clamp">${out.join("")}</g>`;
}
const clamps = (half, yc) => byDepth([[-1, -yc], [1, -yc], [-1, yc], [1, yc]].map(([d, y]) => [d * (half + CLAMP.len / 2), y, d])).map(([x, y, d]) => clamp(y, d, half)).join("");

// ---------- the CNC at a pose ----------
function cnc({ x, y, z }, work) {
  const dz = WORK_TOP - SPINDLE_T + z; // the spindle is modelled for a job at SPINDLE_T
  const groups = carriage();
  return [
    base(), upright(BASE.x), yDrive(),
    `<g transform="${k.translateAlong(P, [0, -y, 0])}">${table(() => spoilboard() + work())}</g>`,
    beam(), chainSvg(chainOf(x, (p) => k.iso(p, P))),
    `<g transform="${k.translateAlong(P, [x, 0, 0])}">${groups.before}`
      + `<g transform="${k.translateAlong(P, [0, 0, dz])}">${zStage()}</g>`
      + groups.after
      + `<path class="iso-line cnc-cable" data-tone="mid" d="${cableOf(dz, (p) => k.iso(p, P))}"/>`
      + D([[-37.5, -62, 338]], { size: 1, tone: "mid" }) + `</g>`,
    upright(215),
    box(245, -100, 5, 48, 212, 46, { tone: "mid" }, 2, 0.6), motorAlong("x", 250, -76, 235), box(278, -57, 9, 4, 240, 12, { tone: "mid" }, 0.6, 0),
    lead([[282, -53, 246], [282, -44, 246], [240, -44, 246], [240, -44, 4], [232, 70, 4]]),
    motorAlong("y", 204, 0, 26), box(21, 230, 4, 10, 30, 12, { tone: "mid" }, 0.6, 0),
    lead([[25, 235, 36], [52, 235, 36], [52, 235, 3], [204, 225, 3]]),
    controlBox(),
  ].join("");
}

const CNC_VIEW = () => k.fitProjection([[-125, -95, 62], [125, -95, 62], [125, 115, 62], [-125, 115, 62], [0, -40, 345]], WIDTH, HEIGHT, { pad: 16, azimuth: 50 });

// ---------- the fiber laser, zoomed in: plate, column, Z carriage, galvo head, lens ----------
const PLATE = { x: -150, y: -150, w: 300, d: 300, r: 3 };
const LENS_Z = 190;

function laserBack() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -190, y: -240, w: 380, d: 410, r: 8 }, -70, 40, P)}"/>`);
  // Machine base under the plate.
  const foot = { x: -190, y: -240, w: 380, d: 410, r: 8 };
  out.push(S(k.slabOf(foot, -70, 46, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(foot, -38, P, 6), { tone: "faint" }) }));
  // Column, with a foot flange, a seam, a Z rail on each side of the lead screw and a Z scale.
  const col = { x: -42, y: -222, w: 84, d: 56, r: 3 };
  out.push(box(-62, -232, 124, 76, -24, 10, { tone: "mid" }, 2, 0.8));
  out.push(D([[-54, -162, -14], [54, -162, -14], [-54, -226, -14], [54, -226, -14]], { size: 0.6 }));
  out.push(S(k.slabOf(col, -14, 470, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(col, 30, P, 4) + k.sideSeam(col, 420, P, 4), { tone: "faint" }) }));
  const fy = col.y + col.d;
  for (const x of [-30, 22]) {
    out.push(box(x, fy, 8, 5, 20, 410, { tone: "mid" }, 0.6, 0.3));
    const bolts = []; for (let z = 40; z <= 420; z += 38) bolts.push([x + 4, fy + 5, z]);
    out.push(D(bolts, { size: 0.45, tone: "lo" }));
  }
  out.push(can(0, fy + 6, 4, 22, 406, { tone: "mid", crease: "none" }, 18));
  let threads = ""; for (let z = 26; z < 424; z += LEAD) threads += k.sideArc(0, fy + 6, 4, z, P, 16);
  out.push(L(threads, { tone: "lo" }));
  const nx = col.x + col.w;
  for (let z = 40; z <= 400; z += 10) out.push(L(k.segment([nx, -192, z], [nx, (z - 40) % 50 ? -188 : -183, z], P), { tone: (z - 40) % 50 ? "lo" : "mid", free: "end" }));
  out.push(seg([nx, -192, 40], [nx, -192, 400], "lo"));
  // Handwheel on the column's top.
  out.push(box(-46, -226, 92, 64, 456, 6, { tone: "mid" }, 2, 0.6), screwTop(-38, -218, 462, 2), screwTop(38, -218, 462, 2));
  out.push(can(0, -194, 8, 462, 12, { tone: "mid" }, 20));
  out.push(can(0, -194, 30, 474, 12, { tone: "mid" }, 44, 0.8), L(k.knurl(0, -194, 30, 474, 486, 54, P), { tone: "lo" }));
  out.push(L(k.ring(0, -194, 21, 486, P, 36), { tone: "faint" }), can(16, -194, 3.2, 486, 16, { tone: "mid", crease: "none" }, 12));
  // Work plate with a grid of threaded holes, a groove, corner screws and rulers along two edges.
  const side = k.sideSeam(PLATE, -9, P, 4);
  out.push(S(k.slabOf(PLATE, -24, 24, P, 4, 0.8), { tone: "mid", inner: L(side, { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const grid = [];
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) grid.push([i * 30, j * 30]);
  for (const [x, y] of byDepth(grid)) out.push(`<path fill="#8c8c90" d="${k.ring(x, y, 3, 0, P, 16)}"/>` + L(k.ring(x, y, 3, 0, P, 16), { tone: "mid" }) + L(k.ring(x, y, 1.7, 0, P, 12), { tone: "lo" }));
  out.push(k.corners(PLATE, 12).map(([x, y]) => screwTop(x, y, 0, 3)).join(""));
  out.push(S(k.slabOf({ x: -134, y: 134, w: 268, d: 9, r: 0.5 }, 0, 0.6, P, 2), { tone: "lo", crease: "none" }));
  const tx = k.topTicks(-130, 130, 10, 5, 134, 0.6, [4.5, 9], P);
  out.push(L(tx.minor, { tone: "lo" }), L(tx.major, { tone: "mid" }));
  return out.join("");
}

function laserFront() {
  const out = [];
  const fy = -166;
  // Z carriage on the rails: bearing blocks, a plate, then the arm to the head.
  for (const x of [-26, 26]) for (const z of [262, 330]) out.push(box(x - 14, fy + 5, 28, 12, z, 26, { tone: "mid" }, 2, 0.5));
  out.push(box(-50, fy + 17, 100, 10, 248, 130, { tone: "mid" }, 2, 0.8));
  out.push(D([[-43, fy + 27, 256], [43, fy + 27, 256], [-43, fy + 27, 370], [43, fy + 27, 370]], { size: 0.6 }));
  const arm = { x: -36, y: fy + 27, w: 72, d: 66, r: 2 };
  out.push(S(k.slabOf(arm, 282, 62, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(arm, 292, P, 3), { tone: "faint" }) }));
  out.push(screwTop(-26, fy + 40, 344, 2), screwTop(26, fy + 40, 344, 2));
  // Galvo head.
  const head = { x: -50, y: -78, w: 100, d: 122, r: 6 };
  const headZ = LENS_Z + 76, headH = 92;
  out.push(S(k.slabOf(head, headZ, headH, P, 8, 1), { tone: "mid", inner: L(k.sideSeam(head, headZ + 12, P, 8) + k.sideSeam(head, headZ + headH - 16, P, 8), { tone: "faint" }) }));
  const hx = head.x + head.w, hy = head.y + head.d, top = headZ + headH;
  for (let z = headZ + 22; z <= headZ + 62; z += 10) out.push(closed(faceX(hx, -60, 26, z, z + 4), "lo"));
  out.push(D([[hx, -70, headZ + 6], [hx, 36, headZ + 6], [hx, -70, headZ + headH - 8], [hx, 36, headZ + headH - 8]], { size: 0.6 }));
  // Label plate and power light on the front face.
  out.push(closed(faceY(hy, -36, 18, headZ + 28, headZ + 62), "mid"));
  for (const [z, a, b] of [[headZ + 54, -30, 10], [headZ + 46, -30, 0], [headZ + 38, -30, 13]]) out.push(L(k.segment([a, hy, z], [b, hy, z], P), { tone: "faint", free: true }));
  out.push(k.corners(head, 11).map(([x, y]) => screwTop(x, y, top, 2.2)).join(""));
  out.push(L(k.planOutline(k.insetPlan(head, 5), top, P, 4), { tone: "faint" }));
  // Fiber gland on top, with the armoured fiber running back over the arm to the column.
  out.push(can(-20, -40, 11, top, 6, { tone: "mid" }, 28), can(-20, -40, 7, top + 6, 12, { tone: "mid" }, 22));
  out.push(lead([[-20, -40, top + 18], [-20, -40, top + 42], [-20, -150, top + 42], [-20, -166, top + 60]]));
  return out.join("");
}

function lens() { // bottom to top, so each part covers the top face of the one below
  const out = [];
  out.push(S(k.cylinder(0, 0, 31, LENS_Z, 14, P, 48, 0.6), { tone: "hi", crease: "none", className: "pcb-dark" }));
  out.push(can(0, 0, 37, LENS_Z + 14, 10, { tone: "mid" }, 56, 0.5));
  out.push(can(0, 0, 37, LENS_Z + 24, 8, { tone: "mid" }, 56, 0.4), L(k.knurl(0, 0, 37, LENS_Z + 24, LENS_Z + 32, 64, P), { tone: "lo" }));
  out.push(can(0, 0, 37, LENS_Z + 32, 38, { tone: "mid" }, 56, 0));
  let fins = ""; for (let z = LENS_Z + 40; z < LENS_Z + 66; z += 4) fins += k.sideArc(0, 0, 37, z, P, 44);
  out.push(L(fins, { tone: "lo" }));
  out.push(box(-40, -40, 80, 80, LENS_Z + 70, 6, { tone: "mid" }, 2, 0.6));
  return out.join("");
}

function beam3(spot) {
  const d = k.pathOf([[0, 0, LENS_Z], spot].map(at));
  return `<path class="pcb-beam-glow" d="${d}"/><path class="pcb-beam" d="${d}"/>`;
}

const LASER_VIEW = () => k.fitProjection([[-125, -110, 0], [125, -110, 0], [125, 125, 0], [-125, 125, 0], [0, -60, LENS_Z + 135]], WIDTH, HEIGHT, { pad: 16, azimuth: 50 });

const PAPER = { x: SX - 4, y: SY, w: SHEET_W + 8, d: SHEET_D };
function paper(cutOut) {
  const outer = k.pathOf([[PAPER.x, PAPER.y], [PAPER.x + PAPER.w, PAPER.y], [PAPER.x + PAPER.w, PAPER.y + PAPER.d], [PAPER.x, PAPER.y + PAPER.d]].map(([x, y]) => at([x, y, 0.2])), true);
  const inner = k.pathOf([[OX, OY], [OX + SW, OY], [OX + SW, OY + SH], [OX, OY + SH]].map(([x, y]) => at([x, y, 0.2])), true);
  return `<path class="pcb-paper" d="${outer}${cutOut ? " " + inner : ""}"/>`;
}
function tapes() {
  const out = [];
  for (const x of [PAPER.x + 3, PAPER.x + PAPER.w - 13]) for (const y of [PAPER.y - 7, PAPER.y + PAPER.d - 21]) {
    out.push(S(k.slabOf({ x, y, w: 10, d: 28, r: 0.3 }, 0.2, 0.3, P, 2, 0), { tone: "mid", crease: "none", className: "pcb-tape" }));
  }
  return out.join("");
}

// Zoom in on the workpiece: scale the view and put point c at the screen position `to`.
const ZOOM = 1.3;
function zoomed(view, c, to) {
  const out = { ...view, scale: view.scale * ZOOM, origin: [0, 0] };
  const [x, y] = k.iso(c, out);
  out.origin = [to[0] - x, to[1] - y];
  return out;
}

// ---------- labels: a ring on the part, a line, the words ----------
function labels(list) {
  return list.map(([p, dx, dy, text]) => {
    const [x, y] = at(p), n = Math.hypot(dx, dy), r = 7;
    const a = dx >= 0 ? "start" : "end";
    return `<circle class="pcb-ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`
      + `<line class="pcb-lead" x1="${(x + (dx / n) * r).toFixed(1)}" y1="${(y + (dy / n) * r).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}"/>`
      + `<text class="pcb-label" x="${(x + dx + (dx >= 0 ? 7 : -7)).toFixed(1)}" y="${(y + dy + 6).toFixed(1)}" text-anchor="${a}">${text}</text>`;
  }).join("");
}

function write(name, alt, body) {
  const card = `<defs><clipPath id="card"><rect width="${WIDTH}" height="${HEIGHT}" rx="14"/></clipPath></defs><g clip-path="url(#card)"><rect width="${WIDTH}" height="${HEIGHT}" fill="#fbfbfa"/>${body}</g>`;
  writeFileSync(join(OUT, name + ".svg"), k.figureSvg({ width: WIDTH, height: HEIGHT, label: alt, body: CSS + card, standalone: "light" }));
  console.log("wrote", name);
}

// ---------- the five frames ----------
const FRAMES = {
  1() {
    const pose = { x: PINS[0][0], y: PINS[0][1], z: 0 };
    P = zoomed(CNC_VIEW(), [0, -pose.y, WORK_TOP], [450, 490]);
    const on = (x, y, z) => [x, y - pose.y, z];
    const mark = k.pathOf([[OX, OY], [OX + SW, OY], [OX + SW, OY + SH], [OX, OY + SH]].map(([a, b]) => at([a, b, WORK_TOP])), true);
    const work = () => copper(SHEET, FIX_TOP, T) + `<path class="pcb-mark" d="${mark}"/>` + PINS.slice(1).map(([x, y]) => hole(x, y, WORK_TOP)).join("") + clamps(SHEET_W / 2, 42);
    write("align-1-pins", "The CNC drills four pin holes in a bare copper board.", cnc(pose, work) + labels([
      [on(...PINS[2], WORK_TOP), 26, 112, "pin hole, 2 mm in from the outer's corner"],
      [on(-6, OY + SH, WORK_TOP), -100, 50, "where the outer will be cut"],
      [on(35, 14, WORK_TOP), 230, 70, "bare copper board"],
      [[pose.x, 0, WORK_TOP + 10], -240, 10, "drill bit"],
      [on(SHEET_W / 2 + 48, -42, WORK_TOP + CLAMP.h), 60, 62, "3D-printed clamp"],
    ]));
  },
  2() {
    const pose = { x: OX - BIT / 2, y: OY + 8, z: 0 };
    P = zoomed(CNC_VIEW(), [0, -pose.y, WORK_TOP], [450, 490]);
    const on = (x, y, z) => [x, y - pose.y, z];
    const work = () => copper(SHEET, FIX_TOP, T) + groove(WORK_TOP) + PINS.map(([x, y]) => hole(x, y, WORK_TOP)).join("") + clamps(SHEET_W / 2, 42);
    write("align-2-outer", "The CNC routes the outer; tabs keep it attached to the board.", cnc(pose, work) + labels([
      [on(0, OY + SH + BIT / 2, WORK_TOP), -105, 92, "tab holds the outer in place"],
      [on(4, 10, WORK_TOP), 330, 90, `outer, ${SW} × ${SH} mm`],
      [[pose.x, 0, WORK_TOP + 10], -240, 10, "router bit"],
    ]));
  },
  3() {
    P = zoomed(LASER_VIEW(), [0, 0, 0], [500, 500]);
    const z = 0.25, hy = OY + SH * 0.55, spot = [OX + SW, hy, z];
    const done = k.pathOf([[OX, OY, z], [OX + SW, OY, z], spot].map(at));
    const todo = k.pathOf([spot, [OX + SW, OY + SH, z], [OX, OY + SH, z], [OX, OY, z]].map(at));
    const [sx, sy] = at(spot);
    write("align-3-jig-cut", "The laser cuts the outer's shape into black paper taped to the plate.",
      laserBack() + paper(false) + tapes() + `<path class="pcb-todo" d="${todo}"/><path class="pcb-cut" d="${done}"/>`
      + beam3(spot) + lens() + laserFront() + `<circle class="pcb-spot" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3.2"/>`
      + labels([
        [[PAPER.x + PAPER.w, PAPER.y + PAPER.d * 0.72, 0.2], 150, 50, "black paper"],
        [[PAPER.x + PAPER.w - 8, PAPER.y - 2, 0.5], 170, -20, "blue tape"],
        [[OX, OY + SH * 0.6, z], -200, 40, "cut = outer shape"],
        [[-22, 16, LENS_Z + 7], -210, -10, "lens"],
      ]));
  },
  4() {
    P = zoomed(LASER_VIEW(), [0, 0, 0], [500, 500]);
    const LIFT = 26;
    const drops = [[OX, OY + SH], [OX + SW, OY + SH], [OX + SW, OY]].map(([x, y]) => `<path class="pcb-drop" d="${k.pathOf([[x, y, 0.2], [x, y, LIFT]].map(at))}"/>`).join("");
    write("align-4-jig-fit", "The outer drops into the cut-out in the black paper.",
      laserBack() + paper(true) + tapes() + drops + copper(OUTER, LIFT, T) + PINS.map(([x, y]) => hole(x, y, LIFT + T)).join("")
      + lens() + laserFront()
      + labels([
        [[OX + SW, OY + SH * 0.6, LIFT + T], 170, 40, "outer drops in, no wiggle"],
        [[OX + SW * 0.3, OY + SH, 0.2], -210, 60, "cut-out in the paper"],
      ]));
  },
  5() {
    const pose = { x: 0, y: OY + 4, z: 34 };
    P = zoomed(CNC_VIEW(), [0, -pose.y, WORK_TOP], [450, 490]);
    const on = (x, y, z) => [x, y - pose.y, z];
    const line = k.pathOf([[-BOARD[0] / 2, -BOARD[1] / 2], [BOARD[0] / 2, -BOARD[1] / 2], [BOARD[0] / 2, BOARD[1] / 2], [-BOARD[0] / 2, BOARD[1] / 2]].map(([a, b]) => at([a, b, WORK_TOP])), true);
    const work = () => copper(OUTER, FIX_TOP, T) + `<path class="pcb-mark" d="${line}"/>` + byDepth(PINS).map(([x, y]) => can(x, y, 0.9, WORK_TOP, 6, { tone: "hi", crease: "none", lit: true }, 12)).join("") + clamps(SW / 2, 34);
    write("align-5-cnc-pins", "Back on the CNC, four pins go through the holes into the spoilboard.", cnc(pose, work) + labels([
      [on(...PINS[1], WORK_TOP + 6), 110, -90, "0.8 mm pin"],
      [on(-4, BOARD[1] / 2, WORK_TOP), -140, 75, "finished board edge"],
      [on(SW / 2 + 48, -34, WORK_TOP + CLAMP.h), 70, 70, "clamp, only 2 mm over the edge"],
    ]));
  },
};

const pick = process.argv.slice(2).map(Number);
for (const n of pick.length ? pick : [1, 2, 3, 4, 5]) FRAMES[n]();

