import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { hero, profile } from '../data/content'
import { prefersReducedMotion, scrollToId } from '../lib/motion'
import { intro } from '../lib/intro'
import { store } from '../webgl/sceneStore'
import { Button } from './ui/Button'
import { Rotator } from './ui/Rotator'

/** Renders `*word*` segments in the italic serif. */
const Emphasis = ({ text }: { text: string }) =>
  text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>,
  )

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const glyph = useRef<HTMLDivElement>(null)

  // Desktop: the WebGL glyph centres itself in this box.
  useEffect(() => {
    store.heroAnchor = glyph.current
    return () => {
      store.heroAnchor = null
    }
  }, [])

  // Intro timeline (paused until the loader lifts) + scroll parallax.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tagline = SplitText.create('.hero__tagline', { type: 'lines', mask: 'lines' })
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      tl.from('.nav__brand, .nav__links > a, .nav__cta, .nav__toggle', { y: -28, autoAlpha: 0, duration: 1.2, stagger: 0.06 }, 0)
        .from('.hero__name, .hero__eyebrow > *', { y: 18, autoAlpha: 0, duration: 1, stagger: 0.06 }, 0.1)
        .from('.hero__line-inner', { yPercent: 110, duration: 1.5, stagger: 0.1 }, 0.2)
        .from(tagline.lines, { yPercent: 110, duration: 1.2, stagger: 0.08 }, 0.7)
        .from('.hero__actions > *', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.85)
        .from('.hero__meta-rule', { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: 'expo.inOut' }, 0.7)
        .from('.hero__meta-item', { y: 20, autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.05)
      intro.register(tl)

      gsap.to('.hero__copy', {
        yPercent: -18,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => {
      intro.register(null)
      ctx.revert()
    }
  }, [])

  return (
    <section id="top" ref={root} className="hero" data-scene="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="hero__name">{profile.name}</p>
          <p className="hero__eyebrow">
            <span className="hero__status">
              <span className="dot" aria-hidden /> {profile.role}
            </span>
            <span className="hero__eyebrow-sep hero__eyebrow-sep--spec" aria-hidden>
              /
            </span>
            <Rotator words={hero.specialties} delay={2.5} />
          </p>

          <h1 className="hero__title">
            <span className="sr-only">{hero.headline.join(' ').replace(/\*/g, '')}</span>
            {hero.headline.map((line) => (
              <span key={line} className="hero__line" aria-hidden>
                <span className="hero__line-inner">
                  <Emphasis text={line} />
                </span>
              </span>
            ))}
          </h1>

          <div className="hero__foot">
            <p className="hero__tagline">{profile.tagline}</p>
            <div className="hero__actions">
              <Button variant="solid" href="#work" onClick={(e) => (e.preventDefault(), scrollToId('work'))}>
                View selected work
              </Button>
              <Button href={profile.cv} download>
                Download CV
              </Button>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__glyph" ref={glyph} aria-hidden />
        </div>
      </div>

      <div className="container">
        <div className="hero__meta">
          <span className="hero__meta-rule" aria-hidden />
          <div className="hero__meta-item">
            <span className="label">Currently</span>
            <span>
              {profile.current.title} @ {profile.current.company}
            </span>
          </div>
          <div className="hero__meta-item">
            <span className="label">Shipped</span>
            <Rotator words={hero.shipped} interval={2} delay={3.2} />
          </div>
          <div className="hero__meta-item hero__meta-item--xp">
            <span className="label">Experience</span>
            <span>{hero.experience}</span>
          </div>
          <div className="hero__meta-item hero__scroll" aria-hidden>
            <span className="label">Scroll</span>
            <span className="hero__scroll-bar" />
          </div>
        </div>
      </div>
    </section>
  )
}
