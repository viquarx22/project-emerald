export type SectionId = 'home' | 'about' | 'education' | 'skills' | 'projects' | 'journey' | 'contact'

/** Order matters: it is the order of camera zones in the 3D world (zone index = position + 1). */
export const SECTION_ORDER: readonly SectionId[] = [
  'home',
  'about',
  'education',
  'skills',
  'projects',
  'journey',
  'contact',
] as const

export interface NavItem {
  id: SectionId
  label: string
  index: string
}

export type ProjectId = 'aether' | 'cosmos' | 'password-lab' | 'finance' | 'portfolio'

export interface Project {
  id: ProjectId
  name: string
  kicker: string
  year: string
  status: 'live'
  url: string
  /** Display host, derived from the real URL. */
  host: string
  description: string
  /** Technologies that are verified for this project. */
  stack: string[]
  /** Descriptive tags (not technologies). */
  tags: string[]
  /** Only set when a real repository URL exists. */
  repoUrl?: string
  cta: string
  accent: string
  environmentLabel: string
}

export interface EducationRecord {
  id: string
  index: number
  institution: string
  qualification: string
  board?: string
  location?: string
  detail?: string
  period: string
  result?: { value: number; display: string; label: string }
  upcoming?: boolean
}

export type SkillStatus = 'used' | 'exploring'

export interface Skill {
  name: string
  status: SkillStatus
}

export interface SkillCategory {
  id: string
  index: number
  label: string
  blurb: string
  skills: Skill[]
}

export interface JourneyStage {
  id: string
  index: string
  label: string
  title: string
  body: string
}

export interface ContactLink {
  id: 'email' | 'phone' | 'github' | 'instagram'
  label: string
  value: string
  href: string
  external: boolean
}
