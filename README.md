# Alireza Afshar — Portfolio

React 19 · Vite · React Three Fiber · custom GLSL · GSAP (ScrollTrigger, SplitText) · Lenis

> **Full build notes, architecture, decisions and next steps: [HANDOFF.md](HANDOFF.md)**

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run cutout    # regenerate the portrait cutout (macOS)
```

## Where things live

| What | File |
| --- | --- |
| All copy (bio, jobs, projects, awards) | `src/data/content.ts` |
| Per-section particle shape, position, colours | `src/webgl/sceneStore.ts` → `sceneStates` |
| Shapes the particles form + portrait stipple sampler | `src/webgl/shapes.ts` |
| Particle system (morphing, frame-locking) | `src/webgl/Morph.tsx` |
| Particle shaders | `src/webgl/shaders/morph.ts` |
| Source-photo scan reveal (About hover) | `src/webgl/PortraitPhoto.tsx` |
| Portrait cutout | `public/alireza-cutout.png` (from `scripts/cutout.swift`) |
| Smooth scroll + scroll animations | `src/lib/motion.ts` |
| Magnetic / tilt pointer effects | `src/lib/pointer.ts` |
| Styles and design tokens | `src/index.css` |

## How it works, in one paragraph

One fixed canvas sits behind the page holding ~16k particles. Each `<section data-scene="…">`
names a shape: `</>` (hero), Alireza's portrait (about), a UI component grid, a browser window,
a git branch graph, an award sparkle, an envelope (contact). Glyph shapes are drawn on a 2D canvas
and sampled into points; the portrait is stippled from a Vision person cutout and pixel-locked to
its DOM frame. When a section reaches the middle of the screen, the current positions are frozen
and the vertex shader flies every particle through a noise field into the new shape. Lenis,
ScrollTrigger and the WebGL render all share GSAP's ticker, so scroll and scene never drift apart.
