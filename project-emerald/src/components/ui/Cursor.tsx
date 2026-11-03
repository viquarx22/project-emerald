import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { canHover } from '@/lib/dom'

/** Custom cursor: a precise dot plus a trailing ring that expands (and can carry a label) over interactive elements. */
export function Cursor() {
  const [enabled] = useState(() => canHover())
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!enabled || !ring.current || !dot.current) return
    const ringEl = ring.current
    const dotEl = dot.current
    document.documentElement.classList.add('has-cursor')

    gsap.set([ringEl, dotEl], { xPercent: -50, yPercent: -50 })
    const rx = gsap.quickTo(ringEl, 'x', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(ringEl, 'y', { duration: 0.5, ease: 'power3.out' })
    const dx = gsap.quickTo(dotEl, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(dotEl, 'y', { duration: 0.08, ease: 'none' })

    const move = (e: PointerEvent) => {
      rx(e.clientX)
      ry(e.clientY)
      dx(e.clientX)
      dy(e.clientY)
      ringEl.style.opacity = '1'
      dotEl.style.opacity = '1'
    }
    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [data-cursor]')
      ringEl.classList.toggle('is-active', Boolean(target))
      if (label.current) label.current.textContent = target?.dataset.cursor ?? ''
    }
    const leave = () => {
      ringEl.style.opacity = '0'
      dotEl.style.opacity = '0'
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  )
}
