import { useRef } from 'react'
import { useMagnetic } from '../../lib/pointer'
import { RollText } from './RollText'

type Props = {
  children: string
  variant?: 'solid' | 'ghost'
  href?: string
  external?: boolean
  download?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  icon?: React.ReactNode
}

/** Magnetic, tilting pill with a fill that spreads from wherever the cursor enters (and exits). */
export function Button({ children, variant = 'ghost', href, external, download, onClick, className = '', icon }: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  useMagnetic(ref)

  const setOrigin = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  const content = (
    <>
      <span className="btn__fill" aria-hidden />
      <span className="btn__label" data-magnetic-inner>
        <RollText text={children} />
        {icon}
      </span>
    </>
  )

  const shared = {
    ref,
    className: `btn btn--${variant} ${className}`,
    onPointerEnter: setOrigin,
    onPointerLeave: setOrigin,
    onClick,
  }

  if (href) {
    return (
      <a
        {...shared}
        href={href}
        download={download || undefined}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }
  return (
    <button {...shared} type="button">
      {content}
    </button>
  )
}
