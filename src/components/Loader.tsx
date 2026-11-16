import { useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { getLenis, prefersReducedMotion } from '../lib/motion'
import { intro } from '../lib/intro'

/**
 * Short branded intro: counter 000 → 100, then the curtain lifts and the hero builds in.
 *
 * The markup lives in index.html (#boot-loader) so it paints before any JS runs. This component
 * renders nothing: it adopts that element and animates it. Adopting rather than re-rendering
 * keeps the counter the same DOM node, so Lighthouse sees one early LCP instead of a late one.
 */
export function Loader() {
  const [done, setDone] = useState(() => prefersReducedMotion())

  useLayoutEffect(() => {
    const root = document.getElementById('boot-loader')
    if (done || !root) {
      root?.remove()
      document.documentElement.classList.remove('is-loading')
      intro.start()
      return
    }

    // Hand the words from the static CSS offset to GSAP (same position, so nothing moves).
    root.classList.remove('loader--boot')
    const year = root.querySelector<HTMLElement>('[data-loader-year]')
    if (year) year.textContent = `Portfolio ©${new Date().getFullYear()}`
    const count = root.querySelector<HTMLElement>('.loader__count')

    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      const tl = gsap.timeline({ onComplete: () => setDone(true) })
      tl.call(() => getLenis()?.stop())
        .from('.loader__word', { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0)
        .to(
          counter,
          {
            v: 100,
            duration: 1.4,
            ease: 'power3.inOut',
            onUpdate: () => {
              if (count) count.textContent = String(Math.round(counter.v)).padStart(3, '0')
            },
          },
          0.1,
        )
        .to('.loader__bar', { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0.1)
        .to('.loader__word, .loader__count', { yPercent: -110, duration: 0.7, ease: 'expo.in', stagger: 0.04 })
        .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.2')
        // Start the hero while the curtain is still moving, so the two motions overlap.
        .call(
          () => {
            intro.start()
            getLenis()?.start()
          },
          [],
          '-=0.75',
        )
    }, root)
    return () => ctx.revert()
  }, [done])

  return null
}
