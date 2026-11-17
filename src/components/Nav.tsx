import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { nav, profile } from '../data/content'
import { getLenis, prefersReducedMotion, scrollToId } from '../lib/motion'
import { useMagnetic } from '../lib/pointer'
import { RollText } from './ui/RollText'

/** Which nav item lights up for each scene section. */
const sceneToNav: Record<string, string | null> = {
  hero: null,
  about: 'about',
  skills: 'about',
  work: 'work',
  experience: 'experience',
  ai: 'experience',
  contact: 'contact',
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  const links = useRef<HTMLElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const cta = useRef<HTMLAnchorElement>(null)
  const brand = useRef<HTMLAnchorElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuTl = useRef<gsap.core.Timeline | null>(null)

  useMagnetic(cta, { strength: 0.3, tilt: 10 })
  useMagnetic(brand, { strength: 0.25, inner: 0.1, tilt: 0 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track the section in view.
  useLayoutEffect(() => {
    const triggers = gsap.utils.toArray<HTMLElement>('[data-scene]').map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => self.isActive && setActive(sceneToNav[el.dataset.scene ?? ''] ?? null),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  // Sliding pill: follows hover, rests on the active section.
  const movePill = useCallback((target: HTMLElement | null) => {
    if (!pill.current) return
    if (!target) {
      gsap.to(pill.current, { autoAlpha: 0, scale: 0.9, duration: 0.4, ease: 'power3.out' })
      return
    }
    gsap.to(pill.current, {
      x: target.offsetLeft,
      width: target.offsetWidth,
      autoAlpha: 1,
      scale: 1,
      duration: 0.6,
      ease: 'expo.out',
    })
  }, [])

  const activeLink = useCallback(
    () => links.current?.querySelector<HTMLElement>(`[data-id="${active}"]`) ?? null,
    [active],
  )
  useEffect(() => movePill(activeLink()), [activeLink, movePill])

  // Mobile menu timeline: circular reveal from the toggle, links rise from masks.
  useLayoutEffect(() => {
    const el = menu.current
    if (!el || !toggle.current) return
    const ctx = gsap.context(() => {
      const r = toggle.current!.getBoundingClientRect()
      const origin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`
      menuTl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .set(el, { visibility: 'visible' })
        .fromTo(el, { clipPath: `circle(0% at ${origin})` }, { clipPath: `circle(150% at ${origin})`, duration: 1, ease: 'expo.inOut' })
        .from('.menu__text', { yPercent: 120, rotate: 8, transformOrigin: '0% 100%', duration: 1.1, stagger: 0.07 }, 0.35)
        .from('.menu__num', { autoAlpha: 0, x: -10, duration: 0.8, stagger: 0.07 }, 0.55)
        .from('.menu__foot > *', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.06 }, 0.6)
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const tl = menuTl.current
    if (!tl) return
    if (open) {
      getLenis()?.stop()
      tl.timeScale(1).play()
      menu.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    } else if (tl.progress() > 0) {
      tl.timeScale(1.7).reverse()
      getLenis()?.start()
    }
    if (prefersReducedMotion()) tl.progress(open ? 1 : 0)

    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (open) {
      setOpen(false)
      getLenis()?.start()
      window.setTimeout(() => scrollToId(id), 250)
    } else scrollToId(id)
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
        <a ref={brand} href="#top" className="nav__brand" onClick={go('top')} aria-label={`${profile.name}, back to top`}>
          <span className="nav__mark" data-magnetic-inner>
            AA
          </span>
          <span className="nav__name">
            <RollText text={profile.name} />
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary" ref={links} onMouseLeave={() => movePill(activeLink())}>
          <span className="nav__pill" ref={pill} aria-hidden />
          {nav.map((item) => (
            <a
              key={item.id}
              data-id={item.id}
              href={`#${item.id}`}
              onClick={go(item.id)}
              onMouseEnter={(e) => movePill(e.currentTarget)}
              aria-current={active === item.id ? 'true' : undefined}
            >
              <RollText text={item.label} />
            </a>
          ))}
        </nav>

        <a ref={cta} className="nav__cta" href={profile.telegram} target="_blank" rel="noreferrer" aria-label="Let’s talk on Telegram">
          <span className="nav__cta-inner" data-magnetic-inner>
            <span className="dot" aria-hidden />
            <RollText text="Let’s talk" />
          </span>
        </a>

        <button
          ref={toggle}
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </header>

      <div
        id="mobile-menu"
        ref={menu}
        className="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="menu__links">
          {nav.map((item, i) => (
            <a key={item.id} href={`#${item.id}`} className="menu__link" onClick={go(item.id)}>
              <span className="menu__num">0{i + 1}</span>
              <span className="menu__mask">
                <span className="menu__text">{item.label}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.telegram} target="_blank" rel="noreferrer">
            Telegram ↗
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href={profile.cv} download>
            Download CV
          </a>
        </div>
      </div>
    </>
  )
}
