import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../lib/motion'

/** Cycles through words with a masked vertical slide. Width is fixed to the longest word. */
export function Rotator({ words, interval = 2.4, delay = 0 }: { words: string[]; interval?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    const items = gsap.utils.toArray<HTMLElement>('.rotator__item', ref.current)
    gsap.set(items, { yPercent: 110, autoAlpha: 1 })
    gsap.set(items[0], { yPercent: 0 })
    let i = 0
    const step = () => {
      const current = items[i]
      i = (i + 1) % items.length
      gsap.to(current, { yPercent: -110, duration: 0.9, ease: 'expo.inOut' })
      gsap.fromTo(items[i], { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.inOut' })
    }
    let id: number | undefined
    const start = window.setTimeout(() => {
      id = window.setInterval(step, interval * 1000)
    }, delay * 1000)
    return () => {
      clearTimeout(start)
      clearInterval(id)
      gsap.killTweensOf(items)
    }
  }, [words, interval, delay])

  return (
    <span className="rotator" ref={ref}>
      <span className="sr-only">{words.join(', ')}</span>
      {words.map((w) => (
        <span key={w} className="rotator__item" aria-hidden>
          {w}
        </span>
      ))}
    </span>
  )
}
