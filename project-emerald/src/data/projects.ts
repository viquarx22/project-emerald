import type { Project } from '@/types'

/**
 * Every URL below is a real, deployed address taken from the brief / original portfolio.
 * No repository URLs are listed because none exist in the source material.
 * Stack arrays only contain technologies that were already listed for the project.
 */
export const PROJECTS: Project[] = [
  {
    id: 'aether',
    name: 'AETHER',
    kicker: 'Immersive digital universe · 2026',
    year: '2026',
    status: 'live',
    url: 'https://aether-kohl-eight.vercel.app',
    host: 'aether-kohl-eight.vercel.app',
    description:
      'An immersive digital universe experience combining interactive 3D environments, fictional worlds, creative experiments and atmospheric motion design.',
    stack: ['React', 'TypeScript', 'Three.js', 'WebGL', 'Framer Motion'],
    tags: ['Immersive 3D'],
    cta: 'Explore Project',
    accent: '#00DFA0',
    environmentLabel: 'Digital architecture',
  },
  {
    id: 'cosmos',
    name: 'COSMOS',
    kicker: 'Universe simulator · New · 2026',
    year: '2026',
    status: 'live',
    url: 'https://cosmosbymv.netlify.app',
    host: 'cosmosbymv.netlify.app',
    description:
      'A universe simulator — the newest completed project in this portfolio, now live and open to explore.',
    stack: [],
    tags: ['Universe simulator', 'Web'],
    cta: 'Explore COSMOS',
    accent: '#C8B88A',
    environmentLabel: 'Deep space',
  },
  {
    id: 'password-lab',
    name: 'Password Security Lab',
    kicker: 'Cybersecurity · Frontend · 2026',
    year: '2026',
    status: 'live',
    url: 'https://password-security-lab-five.vercel.app',
    host: 'password-security-lab-five.vercel.app',
    description:
      'A browser-based password utility project focused on password generation and security awareness. Built as a practical exploration of frontend development and safer digital habits.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    tags: ['Cybersecurity'],
    cta: 'Explore Project',
    accent: '#8AFFC1',
    environmentLabel: 'Security vault',
  },
  {
    id: 'finance',
    name: 'Student Finance Manager',
    kicker: 'Fintech / Productivity · 2026',
    year: '2026',
    status: 'live',
    url: 'https://studentfinancemanagerbymv.netlify.app',
    host: 'studentfinancemanagerbymv.netlify.app',
    description:
      'A student-focused finance tool for organising expenses and keeping track of personal spending through a clean dashboard.',
    stack: [],
    tags: ['Web app', 'Finance', 'Productivity'],
    cta: 'Explore Project',
    accent: '#C8B88A',
    environmentLabel: 'Financial markets',
  },
  {
    id: 'portfolio',
    name: 'Personal Portfolio',
    kicker: 'Personal branding · 2026',
    year: '2026',
    status: 'live',
    url: 'https://mohammedviquaruddin.netlify.app',
    host: 'mohammedviquaruddin.netlify.app',
    description:
      'This site: the portfolio that documents my learning journey and showcases selected work, rebuilt here as an immersive 3D world.',
    stack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'GSAP'],
    tags: ['Personal branding'],
    cta: 'Explore Project',
    accent: '#00DFA0',
    environmentLabel: 'Monolith',
  },
]
