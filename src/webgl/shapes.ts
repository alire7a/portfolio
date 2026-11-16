// Each shape is drawn once on a 2D canvas, then its filled pixels are sampled into
// particle positions. Adding a new shape = adding one draw function.

export type ShapeKey = 'code' | 'braces' | 'components' | 'browser' | 'branch' | 'spark' | 'mail' | 'halo' | 'portrait'
/** Shapes drawn on a canvas at startup; 'portrait' is sampled from a photo cutout and loads async. */
type DrawnShape = Exclude<ShapeKey, 'portrait'>

const S = 512 // canvas resolution
const WORLD = 2.6 // canvas width in world units
const DEPTH = 0.22 // z thickness of the particle "extrusion"
const HALO = 0.06 // share of particles floating loosely around the shape
const EDGE = 0.35 // share of particles placed on outlines, so silhouettes read crisply

const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace'

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
type Draw = (ctx: Ctx2D) => void

/** Works on the main thread and inside the shapes worker (no DOM there). */
function makeCanvas(w: number, h: number) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
const get2D = (c: OffscreenCanvas | HTMLCanvasElement) =>
  c.getContext('2d', { willReadFrequently: true }) as Ctx2D

const text =
  (str: string, maxSize = 360): Draw =>
  (ctx) => {
    ctx.font = `700 ${maxSize}px ${MONO}`
    const w = ctx.measureText(str).width
    const size = Math.min(maxSize, (maxSize * S * 0.92) / w)
    ctx.font = `700 ${size}px ${MONO}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(str, S / 2, S / 2 + size * 0.04)
  }

function roundRect(ctx: Ctx2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

const draws: Record<DrawnShape, Draw> = {
  // Draws nothing: every particle falls back to the loose shell, a halo around the portrait card.
  halo: () => {},
  code: text('</>'),
  braces: text('{ }'),

  // Envelope with a "new message" dot on the corner (cut out with a gap ring).
  mail: (ctx) => {
    const x = 70
    const y = 140
    const w = 372
    const h = 252
    ctx.lineWidth = 16
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    roundRect(ctx, x, y, w, h, 30)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 26, y + 30)
    ctx.lineTo(256, y + 148)
    ctx.lineTo(x + w - 26, y + 30)
    ctx.stroke()
    const dx = x + w - 12
    const dy = y + 6
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(dx, dy, 62, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    ctx.beginPath()
    ctx.arc(dx, dy, 42, 0, Math.PI * 2)
    ctx.fill()
  },

  // A 3×3 grid of UI "components".
  components: (ctx) => {
    const size = 120
    const gap = 28
    const start = (S - (size * 3 + gap * 2)) / 2
    ctx.lineWidth = 12
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        roundRect(ctx, start + c * (size + gap), start + r * (size + gap), size, size, 22)
        if ((r + c) % 4 === 0) ctx.fill()
        else ctx.stroke()
      }
    }
  },

  // Browser window with a page layout inside.
  browser: (ctx) => {
    ctx.lineWidth = 12
    roundRect(ctx, 56, 96, 400, 320, 26)
    ctx.stroke()
    ctx.fillRect(56, 146, 400, 8)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(90 + i * 28, 121, 8, 0, Math.PI * 2)
      ctx.fill()
    }
    roundRect(ctx, 88, 180, 190, 110, 12)
    ctx.fill()
    ctx.fillRect(300, 188, 124, 14)
    ctx.fillRect(300, 216, 96, 14)
    ctx.fillRect(300, 244, 112, 14)
    ctx.lineWidth = 8
    for (let i = 0; i < 3; i++) {
      roundRect(ctx, 88 + i * 117, 314, 102, 74, 12)
      ctx.stroke()
    }
  },

  // Git graph: a main line of commits with a feature branch merging back.
  branch: (ctx) => {
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(196, 56)
    ctx.lineTo(196, 456)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(196, 150)
    ctx.bezierCurveTo(196, 210, 330, 180, 330, 250)
    ctx.lineTo(330, 300)
    ctx.bezierCurveTo(330, 370, 196, 340, 196, 400)
    ctx.stroke()
    for (const y of [86, 196, 320, 430]) {
      ctx.beginPath()
      ctx.arc(196, y, 24, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(330, 275, 20, 0, Math.PI * 2)
    ctx.fill()
  },

  // Four-point sparkle with two small companions.
  spark: (ctx) => {
    const star = (cx: number, cy: number, r: number) => {
      const k = r * 0.1
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.quadraticCurveTo(cx + k, cy - k, cx + r, cy)
      ctx.quadraticCurveTo(cx + k, cy + k, cx, cy + r)
      ctx.quadraticCurveTo(cx - k, cy + k, cx - r, cy)
      ctx.quadraticCurveTo(cx - k, cy - k, cx, cy - r)
      ctx.fill()
    }
    star(236, 276, 200)
    star(420, 96, 56)
    star(440, 220, 28)
  },
}

export const DRAWN_SHAPES = Object.keys(draws) as DrawnShape[]

export function sampleShape(key: DrawnShape, count: number): Float32Array {
  const draw = draws[key]
  const ctx = get2D(makeCanvas(S, S))
  ctx.fillStyle = ctx.strokeStyle = '#fff'
  draw(ctx)

  const data = ctx.getImageData(0, 0, S, S).data
  const filled = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < S && y < S && data[(y * S + x) * 4 + 3] > 128
  const pixels: number[] = []
  const edges: number[] = []
  for (let y = 0; y < S; y += 2) {
    for (let x = 0; x < S; x += 2) {
      if (!filled(x, y)) continue
      pixels.push(x, y)
      if (!filled(x - 2, y) || !filled(x + 2, y) || !filled(x, y - 2) || !filled(x, y + 2)) edges.push(x, y)
    }
  }

  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const o = i * 3
    const roll = Math.random()
    if (roll < HALO || pixels.length === 0) {
      // Loose dust around the shape.
      const r = 1.1 + Math.random() * 0.9
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(Math.random() * 2 - 1)
      out[o] = r * Math.sin(b) * Math.cos(a)
      out[o + 1] = r * Math.sin(b) * Math.sin(a) * 0.7
      out[o + 2] = r * Math.cos(b) * 0.5
      continue
    }
    const src = roll < HALO + EDGE && edges.length ? edges : pixels
    const p = Math.floor(Math.random() * (src.length / 2)) * 2
    const px = src[p] + Math.random() * 2
    const py = src[p + 1] + Math.random() * 2
    out[o] = (px / S - 0.5) * WORLD
    out[o + 1] = -(py / S - 0.5) * WORLD
    // Triangular distribution: denser in the middle of the "extrusion".
    out[o + 2] = (Math.random() + Math.random() - 1) * DEPTH
  }
  return out
}

export type ShapeSet = Partial<Record<ShapeKey, Float32Array>>

/** Returns a shape, sampling it on the spot if it hasn't arrived from the worker yet. */
export function ensureShape(set: ShapeSet, key: ShapeKey, count: number): Float32Array | undefined {
  if (!set[key] && key !== 'portrait') set[key] = sampleShape(key, count)
  return set[key]
}

// ───────────── Portrait: photo cutout → positions + colours ─────────────
//
// White-on-black stipple, like a print: the area behind the person is a soft field of grey-white
// particles, the face is stippled in warm whites taken from the photo, and dark hair / clothing
// get almost no particles, so they read as true black cut out of the field.

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

/** World height of the portrait; Morph scales it to the DOM frame. Width follows the photo. */
export const PORTRAIT_HEIGHT = 2.7

const FIELD_WEIGHT = 0.42 // background density relative to the brightest skin
const FIELD_GREY = 0.72 // background particle brightness (sRGB)
const FIELD_FADE = 0.07 // fraction of the frame over which the field fades out at its edges

export async function loadPortraitShape(src: string, count: number) {
  const img = await createImageBitmap(await (await fetch(src)).blob())
  const W = img.width
  const H = img.height
  const ctx = get2D(makeCanvas(W, H))
  ctx.drawImage(img, 0, 0)
  img.close()
  const data = ctx.getImageData(0, 0, W, H).data
  const N = W * H

  const isPerson = new Uint8Array(N)
  const luma = new Float32Array(N)
  const personLumas: number[] = []
  for (let i = 0; i < N; i++) {
    const o = i * 4
    luma[i] = (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255
    if (data[o + 3] >= 150) {
      isPerson[i] = 1
      personLumas.push(luma[i])
    }
  }

  // Stretch the person's contrast between the 3rd and 97th percentile.
  personLumas.sort((a, b) => a - b)
  const lo = personLumas[Math.floor(personLumas.length * 0.03)] ?? 0
  const hi = personLumas[Math.floor(personLumas.length * 0.97)] ?? 1
  const norm = (l: number) => Math.min(1, Math.max(0, (l - lo) / (hi - lo || 1)))

  const smooth = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)
  }

  // Density per pixel → CDF for weighted sampling.
  const cdf = new Float32Array(N)
  let total = 0
  for (let i = 0; i < N; i++) {
    let w: number
    if (isPerson[i]) {
      w = 0.004 + Math.pow(norm(luma[i]), 1.6)
    } else {
      const x = (i % W) / W
      const y = Math.floor(i / W) / H
      const edge = Math.min(x, 1 - x, y, 1 - y)
      w = FIELD_WEIGHT * smooth(0, FIELD_FADE, edge)
    }
    total += w
    cdf[i] = total
  }
  const pick = () => {
    const r = Math.random() * total
    let a = 0
    let b = N - 1
    while (a < b) {
      const m = (a + b) >> 1
      if (cdf[m] < r) a = m + 1
      else b = m
    }
    return a
  }

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const worldW = (PORTRAIT_HEIGHT * W) / H
  for (let n = 0; n < count; n++) {
    const i = pick()
    const o = n * 3
    const px = i % W
    const py = Math.floor(i / W)
    const nx = (px + Math.random()) / W - 0.5
    const ny = (py + Math.random()) / H - 0.5
    positions[o] = nx * worldW
    positions[o + 1] = -ny * PORTRAIT_HEIGHT

    if (isPerson[i]) {
      const t = norm(luma[i])
      // Nearly flat: any depth would make perspective push particles off the photo underneath.
      positions[o + 2] = (Math.random() - 0.5) * 0.02
      // Photo colour lifted toward white: warm, natural whites rather than a colour ramp.
      const d = i * 4
      const lift = 0.55
      const bright = 0.8 + 0.2 * t
      colors[o] = toLinear((data[d] / 255 + (1 - data[d] / 255) * lift) * bright)
      colors[o + 1] = toLinear((data[d + 1] / 255 + (1 - data[d + 1] / 255) * lift) * bright)
      colors[o + 2] = toLinear((data[d + 2] / 255 + (1 - data[d + 2] / 255) * lift) * bright)
    } else {
      positions[o + 2] = (Math.random() - 0.5) * 0.02
      const g = toLinear(FIELD_GREY * (0.8 + Math.random() * 0.3))
      colors[o] = g
      colors[o + 1] = g
      colors[o + 2] = g * 1.04
    }
  }
  return { positions, colors }
}
