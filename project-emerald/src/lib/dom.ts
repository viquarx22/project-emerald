/**
 * The 3D canvas sits behind the page but listens for pointer events on the whole document.
 * Only treat a 3D click as intentional when it did not land on real interface.
 */
export function isBackgroundTarget(event: Event | undefined | null): boolean {
  const target = event?.target as HTMLElement | null | undefined
  if (!target || typeof target.closest !== 'function') return true
  return !target.closest('a, button, input, textarea, select, [data-ui]')
}

export function setCursor3D(on: boolean) {
  if (on) document.documentElement.dataset.cursor3d = '1'
  else delete document.documentElement.dataset.cursor3d
}

export const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
