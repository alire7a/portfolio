/** Runs `fn` when the main thread is idle, or after `timeout` ms at the latest (Safari has no requestIdleCallback). */
export const whenIdle = (fn: () => void, timeout = 2000) =>
  'requestIdleCallback' in globalThis ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 1)

/**
 * Runs a list of small jobs across idle slices (~10ms of work each), so a big batch of
 * set-up work never turns into one long main-thread task. Returns a cancel function.
 */
export function runInIdleSlices(jobs: (() => void)[], timeout = 500) {
  let cancelled = false
  const slice = () => {
    if (cancelled) return
    const start = performance.now()
    while (jobs.length && performance.now() - start < 10) jobs.shift()!()
    if (jobs.length) whenIdle(slice, timeout)
  }
  whenIdle(slice, timeout)
  return () => {
    cancelled = true
  }
}
