import { PROFILE } from '@/data/profile'

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__name">{PROFILE.nameUpper}</p>
      <p className="footer__line">Built with creativity, technology and engineering.</p>
      <p className="footer__small">© {new Date().getFullYear()}</p>
    </footer>
  )
}
