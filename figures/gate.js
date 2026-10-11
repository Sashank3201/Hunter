/**
 * Gate: the seal of a Gate, three stone rings nested on a stepped plinth. The
 * pointer's height pulls the seal open on one spring: the core's lid comes up
 * to meet it, the middle ring rises half as far, the outer ring stays seated,
 * and dashed drops show where each one sat. Its x picks a ring, which takes
 * the bright stroke and lights its runes. At rest the seal stands a little
 * open and the core is bright. The slider is the widest gap.
 *
 * The pattern: scrub and pick, as in Exploded. The pick is by static bands
 * across x: a ring rises straight up, so its span on screen never changes.
 * Each ring is drawn in two halves, the far one before the rings inside it
 * and the near one after them, so a seated ring's rim still covers the one
 * nested in it.
 */
const {
  Cam, circ, clamp, extremes, facing, fit, hull, open, poly, prism, proj, ringAt, rrect, run, seg,
  spring, stepS, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const T = 5, PB = 46, REST = 0.3, SHUT = 0.06, GTOP = 24;
// outer radius, inner radius (the core is a solid disc), and the runes round its face
const RINGS = [{ ro: 34, ri: 25.5, runes: 12 }, { ro: 22, ri: 14.5, runes: 8 }, { ro: 10.5, ri: 0, runes: 1 }];
const NAMES = ["outer", "inner", "core"];

/** A run of points ordered left to right on screen. */
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
/** Twice the signed area of a screen polygon: its sign is the way it winds. */
const wind = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let G = value, pick = null;
  const C = Cam(45, 0.5, 2.18), zt = 2 * GTOP + T;
  fit(C, [[-PB, -PB, -14], [PB, PB, -14], [PB, -PB, -14], [-PB, PB, -14], [-10.5, 0, zt], [10.5, 0, zt], [0, -10.5, zt], [0, 10.5, zt]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the plinth: two stepped slabs
  for (const [m, z0, z1, r] of [[PB, -14, -7, 12], [PB - 6, -7, 0, 9]]) {
    put(solid(g), prism(P, front, rrect(-m, -m, m, m, r, 8), rrect(-m + 1.6, -m + 1.6, m - 1.6, m - 1.6, r - 1.6, 8), z0, z1));
  }

  // the rings, each with its far half, drops, near half and runes, appended in paint order below
  const R = RINGS.map((d) => ({
    ...d, outer: circ(d.ro, 64), inner: d.ri ? circ(d.ri, 48) : null, crease: circ(d.ro - 1.5, 64),
    angles: Array.from({ length: d.runes }, (_, k) => (k + 0.5) * (2 * Math.PI / d.runes)),
  }));
  const mkHalf = (r, near) => {
    const grp = mk("g", {}, g);
    const el = near
      ? { body: mk("path", { class: "fo" }, grp), crease: mk("path", { class: "nf lo" }, grp), lip: mk("path", { class: "nf" }, grp), sil: mk("path", { class: "nf sil" }, grp) }
      : { body: mk("path", { class: "fo" }, grp), sil: mk("path", { class: "nf sil" }, grp), hole: mk("path", { class: "nf" }, grp), wall: mk("path", { class: "nf lo" }, grp) };
    // a rune on the near half of the face is drawn with the near half; one on the far half with the far half
    el.runes = r.angles.filter((a) => front({ nu: Math.cos(a), nv: Math.sin(a) }) === near).map((a) => ({ a, dot: flatDot(grp, C, 0.75, "dot off") }));
    return el;
  };
  const drop = () => mk("path", { class: "dash" }, g);
  // outer far → middle drops → middle far → core drops → core → middle near → outer near
  R[0].far = mkHalf(R[0], false);
  R[1].drop = drop(); R[1].far = mkHalf(R[1], false);
  R[2].drop = drop(); R[2].solid = solid(g); R[2].near = { runes: [{ a: 0, dot: flatDot(g, C, 1.1, "dot off") }] }; // the core's one rune, at its centre
  R[1].near = mkHalf(R[1], true);
  R[0].near = mkHalf(R[0], true);

  const sp = spring(REST * G, { eps: 0.02 });
  let drawn = NaN;

  function draw(gap) {
    R.forEach((r, k) => {
      const z0 = k * gap, z1 = z0 + T, mid = r.ri ? (r.ro + r.ri) / 2 : 0;
      if (r.ri) {
        const H = hull(ringAt(P, r.outer, z0).concat(ringAt(P, r.outer, z1))), wall = LR(ringAt(P, run(r.inner, (q) => !front(q)), z0));
        const iF = LR(ringAt(P, run(r.inner, front), z1)), oT = LR(ringAt(P, run(r.outer, front), z1)), oB = LR(ringAt(P, run(r.outer, front), z0));
        // the hole is open: what shows through it, under the far edge of its foot and over the near edge of its lip,
        // is wound against the body, so the body's fill leaves it out and the rings and plinth behind show through
        const lens = [...wall, ...iF.slice().reverse()];
        r.far.body.setAttribute("d", poly(H) + poly(Math.sign(wind(lens)) === Math.sign(wind(H)) ? lens.reverse() : lens));
        r.far.sil.setAttribute("d", poly(H));
        r.far.hole.setAttribute("d", poly(ringAt(P, r.inner, z1)));
        r.far.wall.setAttribute("d", open(wall));
        r.near.body.setAttribute("d", poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]));
        r.near.crease.setAttribute("d", open(ringAt(P, run(r.crease, front), z1)));
        r.near.lip.setAttribute("d", open(iF));
        r.near.sil.setAttribute("d", open([oT[0], ...oB, oT[oT.length - 1]]));
      } else {
        put(r.solid, prism(P, front, r.outer, r.crease, z0, z1));
      }
      for (const half of [r.far, r.near]) if (half) half.runes.forEach((u) => place(u.dot, P(Math.cos(u.a) * mid, Math.sin(u.a) * mid, z1)));
      // dashed drops from a lifted ring's left and right edges to the top of the ring it sat in
      if (k > 0) {
        const zb = (k - 1) * gap + T, [L, Rt] = extremes(P, r.outer);
        r.drop.setAttribute("d", z0 > zb + 0.8 ? [L, Rt].map((s) => seg(P(s.u, s.v, z0), P(s.u, s.v, zb))).join("") : "");
      }
    });
  }

  const B = register(stage, (dt) => {
    const moving = stepS(sp, dt);
    if (sp.x !== drawn) { drawn = sp.x; draw(sp.x); }
    return moving;
  });
  bag.add(B.unregister);

  /** The bright stroke and the lit runes go to one ring: the core at rest, the picked ring otherwise. */
  function bright(k) {
    R.forEach((r, i) => {
      const on = i === k;
      for (const el of r.ri ? [r.far.sil, r.near.sil] : [r.solid.sil]) el.classList.toggle("hi", on);
      for (const half of [r.far, r.near]) if (half) half.runes.forEach((u) => u.dot.setAttribute("class", on ? (r.ri ? "dot m" : "dot") : "dot off"));
    });
  }
  // the pointer's height is where the core's lid goes: the gap that puts it there, clamped to the slider
  const y0 = P(0, 0, 0)[1], dz = y0 - P(0, 0, 1)[1], cx = P(0, 0, 0)[0];
  const gapAt = (y) => clamp(((y0 - y) / dz - T) / 2, SHUT * G, G);
  // static bands across x, split halfway between one ring's outer edge and the next one's inner edge
  const half = (r) => { const e = extremes(P, circ(r, 64))[1]; return P(e.u, e.v, 0)[0] - cx; };
  const W1 = half((RINGS[2].ro + RINGS[1].ri) / 2), W2 = half((RINGS[1].ro + RINGS[0].ri) / 2);
  let ly = null;
  const target = () => { sp.t = ly === null ? REST * G : gapAt(ly); B.wake(); };
  function choose(k) {
    if (k === pick) return;
    pick = k;
    bright(k < 0 ? 2 : k);
    read.textContent = k < 0 ? "rest" : NAMES[k];
  }
  choose(-1);

  bag.add(pointer(stage, {
    move: (p) => {
      ly = p[1]; target();
      const d = Math.abs(p[0] - cx);
      choose(d < W1 ? 2 : d < W2 ? 1 : 0);
    },
    leave: () => { ly = null; target(); choose(-1); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { G = v; target(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "gate",
  means: "A Gate's seal of three stone rings: raise the pointer to lift them apart, and the ring it is over lights.",
  rules: [1, 3, 4, 6],
  range: [10, 16, 24],
  tour: [[140, 188], [238, 132], [200, 100], null],
  mount,
});
