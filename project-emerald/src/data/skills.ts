import type { SkillCategory } from '@/types'

/**
 * Conservative by design: only technologies that appear in the original portfolio, in the
 * AETHER project stack, or in live deployments are marked "used". Areas the original portfolio
 * describes as things being learned are marked "exploring". Add more here as your experience grows.
 */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'languages',
    index: 0,
    label: 'Programming languages',
    blurb: 'The languages behind every project on this site.',
    skills: [
      { name: 'HTML', status: 'used' },
      { name: 'CSS', status: 'used' },
      { name: 'JavaScript', status: 'used' },
      { name: 'TypeScript', status: 'used' },
    ],
  },
  {
    id: 'frontend',
    index: 1,
    label: 'Frontend development',
    blurb: 'Interfaces that are structured, styled and brought to life with code.',
    skills: [
      { name: 'HTML', status: 'used' },
      { name: 'CSS', status: 'used' },
      { name: 'JavaScript', status: 'used' },
      { name: 'React', status: 'used' },
      { name: 'Framer Motion', status: 'used' },
    ],
  },
  {
    id: 'backend',
    index: 2,
    label: 'Backend development',
    blurb: 'Foundations in progress — learning how data and systems work behind the interface.',
    skills: [
      { name: 'Databases', status: 'exploring' },
      { name: 'Networking basics', status: 'exploring' },
      { name: 'Computer systems', status: 'exploring' },
    ],
  },
  {
    id: '3d',
    index: 3,
    label: '3D development',
    blurb: 'Real-time 3D in the browser.',
    skills: [
      { name: 'Three.js', status: 'used' },
      { name: 'WebGL', status: 'used' },
    ],
  },
  {
    id: 'frameworks',
    index: 4,
    label: 'Frameworks',
    blurb: 'Component-driven application development.',
    skills: [{ name: 'React', status: 'used' }],
  },
  {
    id: 'tools',
    index: 5,
    label: 'Development tools',
    blurb: 'Where code lives and ships.',
    skills: [
      { name: 'GitHub', status: 'used' },
      { name: 'Vercel', status: 'used' },
      { name: 'Netlify', status: 'used' },
    ],
  },
]
