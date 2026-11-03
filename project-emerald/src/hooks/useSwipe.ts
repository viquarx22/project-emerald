import { useEffect, type RefObject } from 'react'

/** Horizontal swipe detection that never fights vertical page scrolling. */
export function useSwipe(ref: RefObject<HTMLElement | null>, onLeft: () => void, onRight: () => void) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let startX = 0
    let startY = 0
    const down = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const up = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onLeft : onRight)()
    }
    el.addEventListener('touchstart', down, { passive: true })
    el.addEventListener('touchend', up, { passive: true })
    return () => {
      el.removeEventListener('touchstart', down)
      el.removeEventListener('touchend', up)
    }
  }, [ref, onLeft, onRight])
}
