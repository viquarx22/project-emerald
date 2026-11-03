import type { JourneyStage } from '@/types'

/** Built only from facts in the original portfolio and brief. Dates are not invented. */
export const JOURNEY: JourneyStage[] = [
  {
    id: 'foundation',
    index: '01',
    label: 'Foundation',
    title: 'Secondary school',
    body: 'Secondary School Certificate (10th) at Grace Excel High School, Hyderabad — completed with 82%.',
  },
  {
    id: 'science',
    index: '02',
    label: '2025',
    title: 'Mathematics, Physics & Chemistry',
    body: 'Intermediate (MPC) at Gyanam Junior College under TGBIE — completed with 95%.',
  },
  {
    id: 'building',
    index: '03',
    label: '2026',
    title: 'Learning by building',
    body: 'Hands-on projects: Password Security Lab, Student Finance Manager and a personal portfolio — turning concepts into something usable.',
  },
  {
    id: 'immersive',
    index: '04',
    label: '2026',
    title: 'Into immersive 3D',
    body: 'AETHER, an immersive digital universe, and COSMOS, a universe simulator — both live. This portfolio became a 3D world of its own.',
  },
  {
    id: 'next',
    index: '05',
    label: 'Feb 2027',
    title: 'The next stage',
    body: 'Bachelor of Information Technology at Auckland Institute of Studies, New Zealand.',
  },
]
