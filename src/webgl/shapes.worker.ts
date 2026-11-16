// Samples every particle shape off the main thread (OffscreenCanvas), hero glyph first,
// then the portrait. Each result is transferred back as soon as it's ready.
import { DRAWN_SHAPES, loadPortraitShape, sampleShape } from './shapes'
import type { ShapeMessage, ShapeRequest } from './shapeStream'

const post = (msg: ShapeMessage, transfer: Transferable[] = []) =>
  (self as unknown as Worker).postMessage(msg, transfer)

self.onmessage = async (e: MessageEvent<ShapeRequest>) => {
  const { count, portrait } = e.data
  const order = ['code', ...DRAWN_SHAPES.filter((k) => k !== 'code')] as const
  for (const key of order) {
    const positions = sampleShape(key, count)
    post({ key, positions }, [positions.buffer])
  }
  try {
    const { positions, colors } = await loadPortraitShape(portrait, count)
    post({ key: 'portrait', positions, colors }, [positions.buffer, colors.buffer])
  } catch {
    post({ key: 'portrait', failed: true })
  }
}
