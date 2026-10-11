# Hairline figures

Two interactive line drawings for Hunter, made with the hairline-create skill (`.claude/skills/hairline-create`).

- **Arise** (`hairline-arise.html`): 25 shadow soldiers sunk in a stone dais. The ones near the pointer rise out of the floor, and the one under it stands brightest. The slider is the reach of the call, in cells.
- **Gate** (`hairline-gate.html`): a Gate's seal of three stone rings. Raise the pointer to lift them apart; the ring it is over lights. The slider is the widest gap.

Open a page and press play, or add `?play=1` to the address, to watch the pointer's tour.

`arise.js` and `gate.js` are the figures. Each page is the skill's fixed bench and kernel with one figure inside, so edit the figure, never the page. To rebuild a page, run this from this folder:

```
node ../.claude/skills/hairline-create/build.mjs gate.js
```

Check it with `look.mjs` from the same folder; the skill's `look.md` explains the pictures it takes.
