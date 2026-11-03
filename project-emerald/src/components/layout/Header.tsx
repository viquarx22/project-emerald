import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useUI } from '@/state/ui'
import { NAV } from '@/data/profile'
import { scrollToSection } from '@/lib/scroll'
import { SceneControls } from './SceneControls'

/** Top bar: brand, scene controls (desktop) and the menu toggle + full-screen menu (mobile). */
export function Header() {
  const menuOpen = useUI((s) => s.menuOpen)
  const active = useUI((s) => s.activeSection)
  const set = useUI((s) => s.set)

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', menuOpen)
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') set({ menuOpen: false })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, set])

  return (
    <header className="header">
      <a
        className="header__brand"
        href="#home"
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('home')
        }}
        aria-label="Mohammed Viquaruddin — back to top"
        data-cursor="TOP"
      >
        <span className="header__mark">MV</span>
        <span className="header__name">Mohammed Viquaruddin</span>
      </a>

      <div className="header__right">
        <div className="header__controls">
          <SceneControls />
        </div>
        <button
          type="button"
          className="header__menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => set({ menuOpen: !menuOpen })}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Main navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ul>
              {NAV.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: [0.2, 0.75, 0.2, 1] }}
                >
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(item.id)
                    }}
                  >
                    <span className="mobile-menu__index">{item.index}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mobile-menu__controls">
              <SceneControls />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
