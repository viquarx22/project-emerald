import type { ContactLink, NavItem } from '@/types'

export const PROFILE = {
  name: 'Mohammed Viquaruddin',
  nameUpper: 'MOHAMMED VIQUARUDDIN',
  positioning: 'Information Technology Developer | Creative Technologist | 3D Web Enthusiast',
  tagline: 'Curiosity into creation.',
  base: 'Based in India',
  email: 'viquaruddinn@gmail.com',
  /** The dialled number comes from the original portfolio's tel: link. */
  phoneHref: 'tel:+917995762018',
  phoneDisplay: '+91 79957 62018',
  github: 'https://github.com/viquarx22',
  instagram: 'https://www.instagram.com/viquar_22/',
} as const

export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', index: '00' },
  { id: 'about', label: 'About', index: '01' },
  { id: 'education', label: 'Education', index: '02' },
  { id: 'skills', label: 'Skills', index: '03' },
  { id: 'projects', label: 'Projects', index: '04' },
  { id: 'journey', label: 'Journey', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
]

export const ABOUT = {
  lead: 'I’m a student preparing to begin a Bachelor of Information Technology, with a growing interest in the systems and ideas behind the digital world.',
  paragraphs: [
    'I’m curious about how software, networks and computer systems work. I enjoy turning what I learn into small, practical projects — testing ideas, solving problems and improving through iteration.',
    'I completed my Secondary School Certificate with 82% and my Intermediate in Mathematics, Physics and Chemistry with 95%. My current focus is building strong fundamentals and gaining hands-on experience across technology.',
  ],
  traits: ['Curious', 'Consistent', 'Hands-on', 'Adaptable'],
  interests: [
    'Information technology',
    'Software development',
    'Digital experiences',
    'Artificial intelligence',
    'Interactive environments',
    'Technology experimentation',
  ],
}

export const CONTACT_LINKS: ContactLink[] = [
  { id: 'email', label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}`, external: false },
  { id: 'phone', label: 'Phone', value: PROFILE.phoneDisplay, href: PROFILE.phoneHref, external: false },
  { id: 'github', label: 'GitHub', value: 'github.com/viquarx22', href: PROFILE.github, external: true },
  { id: 'instagram', label: 'Instagram', value: '@viquar_22', href: PROFILE.instagram, external: true },
]
