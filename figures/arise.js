/**
 * Arise: a muster of 25 shadow soldiers on a stepped stone dais, sunk to their
 * helms in the floor with only their spears standing clear. The pointer is
 * projected onto the floor, which never moves, and each soldier rises out of it
 * on his own spring, the nearer the higher. At rest the captain stands at full
 * height with the bright stroke, a crescent has half risen in front of him, and
 * the rest wait. The soldier under the pointer takes the bright stroke instead.
 * The slider is the reach of the call, in cells.
 *
 * The pattern: a continuous field, as in Terrain. A spring per soldier, a falloff
 * by distance that reaches a floor, and a rest that is already a scene.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rrect, run, seg, unproj,
  spring, stepS, mk, pointer, put, register, disposer, solid,
} = HL;

const N = 5, CELL = 17, EXT = N * CELL;
const WAIST = 6.4, SHOULDER = 9, PAUL = 12.2, PH = 3.4, HF = 6.2, HT = 3.4, HH = 8, HMAX = 35, SUNK = 3.4, SPEAR = 9;
const CI = 2, CJ = 2; // the captain stands in the middle of the muster

/** The share of full height at u radii from the pointer: 1 → .31 at 42% → .09 at the edge and beyond. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094;

/** Rest: the captain stands, a crescent has half risen on the side facing us, and the rest are sunk to their helms. */
function restH(i, j) {
  if (i === CI && j === CJ) return HMAX;
  const di = i - CI, dj = j - CJ, d = Math.hypot(di, dj), toward = (di + dj) / (d * Math.SQRT2);
  return SUNK + 19 * Math.exp(-((d - 1.25) ** 2) / 0.3) * clamp(0.5 + 0.5 * toward, 0.12, 1);
}

/** A square footprint w across, centred on (x, y), with corner radius r: the ring and its crease, inset by b. */
const sq = (x, y, w, r, b) => [
  rrect(x - w / 2, y - w / 2, x + w / 2, y + w / 2, r, 5),
  rrect(x - w / 2 + b, y - w / 2 + b, x + w / 2 - b, y + w / 2 - b, Math.max(0.3, r - b), 5),
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  // Fitted to the dais's foot and to spears at full height in every corner, the most extreme pose.
  const C = Cam(45, 0.5, 1.85), Z = HMAX + SPEAR;
  fit(C, [[-13, -13, -11], [EXT + 13, EXT + 13, -11], [EXT + 13, -13, -11], [-13, EXT + 13, -11],
    [0, 0, Z], [EXT, 0, Z], [0, EXT, Z], [EXT, EXT, Z]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value * CELL, over = null, act = null;

  const g = mk("g", {}, svg);
  // The dais: two stepped tiers, rounded more than rings() rounds, so built with more steps.
  for (const [m, z0, z1, r] of [[13, -11, -5, 20], [6, -5, 0, 14]]) {
    const ring = rrect(-m, -m, EXT + m, EXT + m, r, 14), inner = rrect(-m + 2, -m + 2, EXT + m - 2, EXT + m - 2, r - 2, 14);
    put(solid(g), prism(P, front, ring, inner, z0, z1));
  }
  // The soldiers, diagonal by diagonal from the back corner, so appending is painting back to front.
  const men = [];
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i;
    if (j < 0 || j >= N) continue;
    const grp = mk("g", {}, g), h0 = restH(i, j);
    men.push({
      i, j, h0, cx: (i + 0.5) * CELL, cy: (j + 0.5) * CELL, sp: spring(h0, { eps: 0.04 }), drawn: NaN,
      body: solid(grp), paul: solid(grp), helm: solid(grp), visor: mk("path", { class: "nf lo" }, grp), spear: mk("path", { class: "nf" }, grp), tip: mk("path", {}, grp),
    });
  }
  const captain = men.find((m) => m.i === CI && m.j === CJ);

  /** One soldier risen h out of the floor: a body that widens to the shoulders, a helm that rounds off on top, a spear at his side. */
  function drawMan(m) {
    const h = m.sp.x;
    if (h === m.drawn) return;
    m.drawn = h;
    const { cx, cy } = m, zs = h - HH, under = HMAX - h;
    if (zs > 0.3) {
      // where the floor cuts him, he is as wide as he is at that height
      const [foot] = sq(cx, cy, lerp(WAIST, SHOULDER, clamp(under / (HMAX - HH), 0, 1)), 2.8, 1), [tp, ti] = sq(cx, cy, SHOULDER, 3.4, 1.2);
      put(m.body, { sil: poly(hull(ringAt(P, foot, 0).concat(ringAt(P, tp, zs)))), crease: open(ringAt(P, run(ti, front), zs)) });
    } else put(m.body, { sil: "", crease: "" });
    // the pauldrons: a band wider than his chest, just under the helm
    if (zs > 0.3) { const [pr, pc] = sq(cx, cy, PAUL, 4, 1.2); put(m.paul, prism(P, front, pr, pc, Math.max(0, zs - PH), zs)); }
    else put(m.paul, { sil: "", crease: "" });
    // the helm tapers to a rounded crown, cut by the floor the same way while he is still under it
    const z0 = Math.max(0, zs), t0 = (z0 - zs) / HH, [hf] = sq(cx, cy, lerp(HF, HT, t0), lerp(2.8, 1.6, t0), 0.6), [ht, hc] = sq(cx, cy, HT, 1.6, 0.6);
    put(m.helm, { sil: poly(hull(ringAt(P, hf, z0).concat(ringAt(P, ht, h)))), crease: open(ringAt(P, run(hc, front), h)) });
    // the visor: one slit round the helm's near corner, facing us
    const zv = h - 4.6, w = lerp(HF, HT, (HH - 4.6) / HH) / 2;
    m.visor.setAttribute("d", zv > 0.6 ? open([P(cx + w, cy - 1.2, zv), P(cx + w - 0.7, cy + w - 0.7, zv), P(cx - 1.2, cy + w, zv)]) : "");
    // the spear: a shaft from his hand, and a leaf-shaped head
    const sx = cx + 7.6, sy = cy - 2.8, zt = h + SPEAR;
    m.spear.setAttribute("d", seg(P(sx, sy, Math.max(0, h - HMAX + 15)), P(sx, sy, zt)));
    m.tip.setAttribute("d", poly([P(sx, sy, zt + 4.4), P(sx + 0.9, sy - 0.9, zt + 1.2), P(sx, sy, zt - 0.6), P(sx - 0.9, sy + 0.9, zt + 1.2)]));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const m of men) { if (stepS(m.sp, dt)) moving = true; drawMan(m); }
    return moving;
  });
  bag.add(B.unregister);

  /** The bright stroke: the captain at rest, the soldier under the pointer otherwise. One soldier, all of him. */
  function bright(pick) {
    if (pick === act) return;
    act = pick;
    for (const m of men) for (const el of [m.body.sil, m.paul.sil, m.helm.sil, m.spear, m.tip]) el.classList.toggle("hi", m === pick);
  }
  function retarget() {
    if (over) {
      for (const m of men) m.sp.t = SUNK + (HMAX - SUNK) * falloff(Math.hypot(m.cx - over[0], m.cy - over[1]) / R);
      const i = clamp(Math.floor(over[0] / CELL), 0, N - 1), j = clamp(Math.floor(over[1] / CELL), 0, N - 1);
      bright(men.find((m) => m.i === i && m.j === j));
      read.textContent = `rank ${j + 1}·${i + 1}`;
    } else {
      for (const m of men) m.sp.t = m.h0;
      bright(captain);
      read.textContent = "rest";
    }
    B.wake();
  }
  retarget();

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * CELL; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "arise",
  means: "A buried shadow army: the soldiers near the pointer rise out of the floor, and the one under it stands brightest.",
  rules: [1, 3, 4, 5],
  range: [1.3, 2.2, 3.4],
  tour: [[200, 206], [133, 173], [267, 173], null],
  mount,
});
