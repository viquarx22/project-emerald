import type { EducationRecord } from '@/types'

/**
 * Chronological order is intentional: 10th -> Intermediate -> upcoming degree.
 * No graduation dates are invented; the degree period is carried over from the original portfolio.
 */
export const EDUCATION: EducationRecord[] = [
  {
    id: 'grace-excel',
    index: 1,
    institution: 'Grace Excel High School',
    qualification: 'Secondary School Certificate (10th)',
    location: 'Kishan Bagh, Hyderabad, Telangana, India',
    period: 'Secondary school',
    result: { value: 82, display: '82%', label: 'Final result' },
  },
  {
    id: 'gyanam',
    index: 2,
    institution: 'Gyanam Junior College',
    qualification: 'Intermediate — MPC',
    board: 'Telangana State Board of Intermediate Education (TGBIE)',
    detail: 'Mathematics, Physics and Chemistry',
    period: 'Completed 2025',
    result: { value: 95, display: '95%', label: 'Final result' },
  },
  {
    id: 'ais',
    index: 3,
    institution: 'Auckland Institute of Studies',
    qualification: 'Bachelor of Information Technology',
    location: 'New Zealand',
    detail: 'Starting my degree to build core knowledge in computing and technology.',
    period: 'Feb 2027 — Dec 2029 (expected)',
    upcoming: true,
  },
]
