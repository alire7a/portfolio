import { useState } from 'react'
import { profile } from '../data/content'
import { scrollToId } from '../lib/motion'
import { Button } from './ui/Button'
import { RollText } from './ui/RollText'

export function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section id="contact" className="section contact" data-scene="contact">
      <div className="container contact__inner">
        <p className="contact__eyebrow" data-reveal>
          <span className="dot" aria-hidden /> Have a product that should feel alive?
        </p>
        <h2 className="contact__title" data-split>
          Let’s build something <em>that moves.</em>
        </h2>

        <a className="contact__email" href={`mailto:${profile.email}`} data-reveal>
          {profile.email}
        </a>

        <div className="contact__actions" data-reveal>
          <Button variant="solid" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy email'}
          </Button>
          <Button href={profile.github} external>
            GitHub ↗
          </Button>
          <Button href={profile.cv} download>
            Download CV
          </Button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Email copied to clipboard' : ''}
          </span>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="footer__built">Built with React Three Fiber, GLSL, GSAP & Lenis</span>
        <a href="#top" className="footer__top" onClick={(e) => (e.preventDefault(), scrollToId('top'))}>
          <RollText text="Back to top ↑" />
        </a>
      </div>
    </footer>
  )
}
