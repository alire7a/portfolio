import { whenIdle } from '../lib/idle'
import { DRAWN_SHAPES, loadPortraitShape, sampleShape, type ShapeKey } from './shapes'

export type ShapeRequest = { count: number; portrait: string }
export type ShapeMessage =
  | { key: ShapeKey; positions: Float32Array; colors?: Float32Array; failed?: undefined }
  | { key: 'portrait'; failed: true; positions?: undefined; colors?: undefined }

type OnShape = (msg: ShapeMessage) => void

const workerSupported = () => {
  try {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && !!new OffscreenCanvas(1, 1).getContext('2d')
  } catch {
    return false
  }
}

/**
 * Streams particle shapes to `onShape`: hero glyph first, then the rest, then the portrait.
 * Sampling runs in a worker so it never blocks the main thread; browsers without
 * OffscreenCanvas fall back to sampling one shape per idle slice. Returns a cancel function.
 */
export function streamShapes(count: number, portrait: string, onShape: OnShape): () => void {
  let cancelled = false
  const emit: OnShape = (msg) => !cancelled && onShape(msg)

  if (workerSupported()) {
    const worker = new Worker(new URL('./shapes.worker.ts', import.meta.url), { type: 'module' })
    let cancel = () => worker.terminate()
    let received = 0
    worker.onmessage = (e: MessageEvent<ShapeMessage>) => {
      emit(e.data)
      if (++received === DRAWN_SHAPES.length + 1) worker.terminate()
    }
    worker.onerror = () => {
      // Worker failed to start (e.g. blocked by CSP): sample on the main thread instead.
      worker.terminate()
      if (!cancelled && received === 0) cancel = sampleOnMainThread(count, portrait, emit)
    }
    worker.postMessage({ count, portrait: new URL(portrait, location.href).href } satisfies ShapeRequest)
    return () => {
      cancelled = true
      cancel()
    }
  }

  const cancel = sampleOnMainThread(count, portrait, emit)
  return () => {
    cancelled = true
    cancel()
  }
}

function sampleOnMainThread(count: number, portrait: string, emit: OnShape) {
  let stopped = false
  const queue = ['code', ...DRAWN_SHAPES.filter((k) => k !== 'code')] as const
  let i = 0
  const next = () => {
    if (stopped) return
    if (i < queue.length) {
      const key = queue[i++]
      emit({ key, positions: sampleShape(key, count) })
      whenIdle(next, i === 1 ? 300 : 2000)
      return
    }
    loadPortraitShape(portrait, count)
      .then(({ positions, colors }) => !stopped && emit({ key: 'portrait', positions, colors }))
      .catch(() => !stopped && emit({ key: 'portrait', failed: true }))
  }
  whenIdle(next, 300)
  return () => {
    stopped = true
  }
}
