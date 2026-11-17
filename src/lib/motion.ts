import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { store, type SceneKey } from '../webgl/sceneStore'
import { runInIdleSlices } from './idle'

gsap.registerPlugin(ScrollTrigger, SplitText)
// ScrollTrigger restores the old scroll position on reload by default; the intro must start at the top.
ScrollTrigger.clearScrollMemory('manual')

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null
export const getLenis = () => lenis

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Lenis smooth scroll, synced to GSAP's ticker so ScrollTrigger and Lenis share one RAF. */
export function useSmoothScroll() {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

const reveal = { duration: 1.2, ease: 'expo.out' }

/**
 * Wires the DOM to the WebGL scene and runs the site-wide scroll animations.
 * - [data-scene]     switches the particle shape while the section is centred.
 * - [data-split]     headings reveal line by line from a mask.
 * - [data-reveal]    elements rise in once.
 * - [data-stagger]   direct children rise in, batched as they enter (chips inside pop in too).
 * - [data-count]     numbers count up from zero.
 * - [data-scrub-words] paragraphs light up word by word with scroll.
 */
export function useScrollChoreography() {
  useLayoutEffect(() => {
    const reduce = prefersReducedMotion()
    // Below-the-fold reveals are set up in small idle slices instead of one long task at mount.
    // Everything they touch sits under the loader / below the fold until well after they run.
    const jobs: (() => void)[] = []

    const ctx = gsap.context(() => {
      // Global progress + velocity for shaders.
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const v = self.getVelocity() / 1000
          store.progress = Number.isFinite(self.progress) ? self.progress : 0
          store.velocity = Number.isFinite(v) ? v : 0
        },
      })
      gsap.ticker.add(decayVelocity)

      gsap.utils.toArray<HTMLElement>('[data-scene]').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) store.target = el.dataset.scene as SceneKey
          },
        })
      })

      if (reduce) return

      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => jobs.push(() => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              ...reveal,
              yPercent: 130,
              rotate: 2.5,
              transformOrigin: '0% 100%',
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
        })
      }))

      gsap.utils.toArray<HTMLElement>('.section-header__rule').forEach((el) => jobs.push(() => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: '0% 50%',
          duration: 1.4,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      }))

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => jobs.push(() => {
        gsap.from(el, {
          ...reveal,
          y: 56,
          autoAlpha: 0,
          delay: Number(el.dataset.revealDelay ?? 0),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      }))

      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => jobs.push(() => {
        const items = Array.from(group.children) as HTMLElement[]
        gsap.set(items, { y: 56, autoAlpha: 0 })
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { ...reveal, y: 0, autoAlpha: 1, stagger: 0.1, overwrite: true })
            batch.forEach((item, i) => {
              const chips = item.querySelectorAll('.chip')
              if (chips.length)
                gsap.from(chips, { y: 16, scale: 0.85, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.035, delay: 0.15 + i * 0.1 })
            })
          },
        })
      }))

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => jobs.push(() => {
        const target = Number(el.dataset.count)
        const suffix = el.dataset.suffix ?? ''
        const obj = { v: 0 }
        el.textContent = `0${suffix}`
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = `${Math.round(obj.v)}${suffix}`),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      }))

      gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => jobs.push(() => {
        gsap.fromTo(
          el.querySelectorAll('.word'),
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true },
          },
        )
      }))
    })
    const cancelJobs = runInIdleSlices(jobs.map((job) => () => ctx.add(job)))

    // Fonts change line breaks; re-measure triggers once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      cancelJobs()
      gsap.ticker.remove(decayVelocity)
      ctx.revert()
    }
  }, [])
}

function decayVelocity() {
  store.velocity *= 0.92
}
