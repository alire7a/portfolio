import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { profile } from '../data/content'
import { prefersReducedMotion } from '../lib/motion'
import { store } from '../webgl/sceneStore'

/**
 * Frame for the particle portrait in the About section.
 * The WebGL particles lock onto `.portrait__media` (see Morph.tsx). Hovering — or tapping on
 * touch screens — sweeps the source photo in underneath them (PortraitPhoto.tsx); the
 * particles stay, so you can see the image they were sampled from.
 */
export function Portrait() {
  const root = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [canHover] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches)

  // Hand the frame to the WebGL scene.
  useEffect(() => {
    store.portraitAnchor = media.current
    return () => {
      store.portraitAnchor = null
      store.portraitHover = 0
    }
  }, [])

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.portrait__chrome', {
        autoAlpha: 0,
        y: 20,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const reveal = (show: boolean) => {
    store.portraitHover = show ? 1 : 0
    setRevealed(show)
  }

  return (
    <figure ref={root} className={`portrait ${revealed ? 'is-revealed' : ''}`}>
      <div className="portrait__hud portrait__chrome" aria-hidden>
        <span>portrait.points</span>
        <span className="portrait__status">
          <span className="dot" /> {revealed ? 'Source: alireza.jpg' : `${canHover ? 'Hover' : 'Tap'} to see the source`}
        </span>
      </div>

      <div
        ref={media}
        className="portrait__media"
        role="img"
        aria-label={`Portrait of ${profile.name}, drawn in particles`}
        onPointerEnter={(e) => e.pointerType === 'mouse' && reveal(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && reveal(false)}
        onPointerUp={(e) => e.pointerType !== 'mouse' && reveal(!revealed)}
      >
        <span className="portrait__corner portrait__corner--tl" aria-hidden />
        <span className="portrait__corner portrait__corner--tr" aria-hidden />
        <span className="portrait__corner portrait__corner--bl" aria-hidden />
        <span className="portrait__corner portrait__corner--br" aria-hidden />
      </div>

      <figcaption className="portrait__caption portrait__chrome">
        <span className="portrait__name">{profile.name}</span>
        <span className="portrait__role">
          {profile.current.title}
        </span>
      </figcaption>
    </figure>
  )
}
