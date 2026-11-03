import type { MouseEventHandler, ReactNode, RefObject } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useMagnetic } from '@/hooks/useMagnetic'

interface ButtonProps {
  children: ReactNode
  href?: string
  external?: boolean
  onClick?: MouseEventHandler<HTMLElement>
  variant?: 'primary' | 'ghost'
  icon?: ReactNode
  /** Show the diagonal arrow (default for external links). */
  arrow?: boolean
  ariaLabel?: string
  cursorLabel?: string
  className?: string
}

/** Magnetic call-to-action. Renders a real <a> for links and a <button> for actions. */
export function Button({
  children,
  href,
  external,
  onClick,
  variant = 'primary',
  icon,
  arrow,
  ariaLabel,
  cursorLabel,
  className = '',
}: ButtonProps) {
  const ref = useMagnetic<HTMLElement>(0.3)
  const classes = `btn btn--${variant} ${className}`.trim()
  const showIcon = Boolean(icon) || Boolean(arrow ?? external)
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {showIcon ? <span className="btn__icon">{icon ?? <ArrowUpRight size={16} aria-hidden="true" />}</span> : null}
    </>
  )

  if (href) {
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        className={classes}
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        data-cursor={cursorLabel ?? (external ? 'OPEN' : 'GO')}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }
  return (
    <button
      ref={ref as RefObject<HTMLButtonElement>}
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel}
      data-cursor={cursorLabel ?? 'GO'}
    >
      {inner}
    </button>
  )
}
