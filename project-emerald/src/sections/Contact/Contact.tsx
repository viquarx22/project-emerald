import { ArrowUpRight, Copy } from 'lucide-react'
import { CONTACT_LINKS, PROFILE } from '@/data/profile'
import { showToast } from '@/state/actions'
import { Button } from '@/components/ui/Button'
import { SectionEyebrow } from '@/components/ui/atoms'

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(PROFILE.email)
    showToast('Email address copied')
  } catch {
    // Clipboard API unavailable (insecure context / permissions): fall back to a selection copy.
    const field = document.createElement('textarea')
    field.value = PROFILE.email
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    try {
      document.execCommand('copy')
      showToast('Email address copied')
    } catch {
      showToast(`Email: ${PROFILE.email}`)
    }
    document.body.removeChild(field)
  }
}

/** SECTION 07 — CONTACT. Every control is a real link or a working action. */
export function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title" tabIndex={-1}>
      <div className="contact__inner">
        <div data-reveal>
          <SectionEyebrow index="06">Contact</SectionEyebrow>
          <h2 id="contact-title" className="display display--xl">
            Let’s make <em>something useful.</em>
          </h2>
          <p className="body contact__copy">
            Open to conversations, learning opportunities and connecting with people who build things.
          </p>
        </div>

        <div className="contact__actions" data-reveal>
          <Button href={`mailto:${PROFILE.email}`} arrow ariaLabel={`Email ${PROFILE.email}`} cursorLabel="MAIL">
            Start a conversation
          </Button>
          <Button onClick={copyEmail} variant="ghost" icon={<Copy size={16} aria-hidden="true" />} ariaLabel="Copy email address" cursorLabel="COPY">
            Copy email
          </Button>
        </div>

        <ul className="contact__list" data-reveal>
          {CONTACT_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                className="contact-link"
                data-cursor={link.external ? 'OPEN' : link.id === 'email' ? 'MAIL' : 'CALL'}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={`${link.label}: ${link.value}${link.external ? ' (opens in a new tab)' : ''}`}
              >
                <span className="contact-link__label">{link.label}</span>
                <span className="contact-link__value">{link.value}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
