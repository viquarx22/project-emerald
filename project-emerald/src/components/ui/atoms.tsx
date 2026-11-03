import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { world } from '@/state/world'

/** Splits text into per-character spans for GSAP entrances while keeping a single accessible label. */
export function SplitChars({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`split ${className}`.trim()} aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span key={i} className="split__mask" aria-hidden="true">
          <span className="split__char">{char === ' ' ? ' ' : char}</span>
        </span>
      ))}
    </span>
  )
}

export function StatusBadge({ label = 'LIVE' }: { label?: string }) {
  return (
    <span className="badge badge--live">
      <i className="badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export function SectionEyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow__index">{index}</span>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

/** Animated numeric read-out (e.g. 82%) that counts up each time it mounts. */
export function CountUp({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (world.reduced) {
      el.textContent = String(value)
      return
    }
    const state = { v: 0 }
    const tween = gsap.to(state, {
      v: value,
      duration: 1.3,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = String(Math.round(state.v))
      },
    })
    return () => {
      tween.kill()
    }
  }, [value])
  return (
    <span className="countup" aria-label={`${value}${suffix}`}>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="countup__suffix" aria-hidden="true">
        {suffix}
      </span>
    </span>
  )
}
