import { store } from '../webgl/sceneStore'

// The loader decides *when* the intro plays; the hero owns *what* plays.
// Hero registers a paused timeline on mount, the loader calls start() as it lifts.

let heroTimeline: gsap.core.Timeline | null = null
let started = false

export const intro = {
  register(tl: gsap.core.Timeline | null) {
    heroTimeline = tl
    if (started) tl?.play()
  },
  start() {
    started = true
    store.ready = true // lets the particles begin building
    heroTimeline?.play()
  },
}
