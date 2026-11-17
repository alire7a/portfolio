import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from './motion'

const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Element drifts toward the cursor and tilts in 3D; an optional inner layer moves further for parallax.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  { strength = 0.35, inner = 0.18, tilt = 12 }: { strength?: number; inner?: number; tilt?: number } = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!el || !finePointer() || prefersReducedMotion()) return
    gsap.set(el, { transformPerspective: 600 })
    const opts = { duration: 0.7, ease: 'power3.out' }
    const x = gsap.quickTo(el, 'x', opts)
    const y = gsap.quickTo(el, 'y', opts)
    const rx = gsap.quickTo(el, 'rotationX', opts)
    const ry = gsap.quickTo(el, 'rotationY', opts)
    const label = el.querySelector<HTMLElement>('[data-magnetic-inner]')
    const lx = label && gsap.quickTo(label, 'x', opts)
    const ly = label && gsap.quickTo(label, 'y', opts)

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      x(dx * strength)
      y(dy * strength)
      ry((dx / r.width) * tilt)
      rx((-dy / r.height) * tilt)
      lx?.(dx * inner)
      ly?.(dy * inner)
    }
    const leave = () => {
      x(0); y(0); rx(0); ry(0); lx?.(0); ly?.(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [ref, strength, inner, tilt])
}
