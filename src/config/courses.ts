import type { Course } from '@/types/quiz';

/**
 * Pilot course list -- rebuilt 2026-09-01 for the UI redesign, replacing
 * Phase 2's original 5-course config.
 *
 * Two real Ada pathways, both genuinely taught at Ada Manchester (Section
 * 1.1's client scope) plus three generic Level 3 comparison categories:
 *
 * - `tlevel-digital` and `apprenticeship` carry REAL content researched
 *   from ada.ac.uk by the hackathon team (Team Dynamite) for the original
 *   "Find Your Path" prototype -- names, URLs, UCAS points, employer
 *   partners, entry requirements. This replaces Phase 2's [PLACEHOLDER]
 *   markers with real, sourced facts, which also resolves a mismatch
 *   with the already-drafted report: FR5 names "Developer Pathway"
 *   specifically, which Phase 2's course list never actually had. Still
 *   worth a final spot-check with Ada admissions before real launch
 *   (Risk R1/R8) -- these are sourced facts, not independently
 *   re-verified today.
 * - `btec-computing` / `creative-media` / `business-enterprise` are
 *   deliberately NOT Ada courses -- they're the generic Level 3
 *   alternatives a Manchester Year 10-11 student would actually be
 *   weighing the T-Level against (Phase 2's original design note), so
 *   they have no `campus`/`url` (nothing to link to -- inventing an Ada
 *   URL for a course Ada doesn't run would misrepresent Ada's offer).
 *   Their qualification/equivalent figures are standard, publicly
 *   documented facts about the BTEC Level 3 National Extended Diploma
 *   qualification type generally (same UCAS tariff banding as a T-Level),
 *   not institution-specific claims.
 *
 * The original prototype's other pathways (Pioneer, Innovator, Creator,
 * Foundation Year) are intentionally NOT included here -- their own data
 * marks them London-only, which would contradict this report's Ada
 * Manchester scope (Section 1.1) and Section 1.3's documented scope-down
 * decision. See old-hackathon-prototype branch, survey.html, for that
 * fuller catalogue if a future phase broadens scope to other campuses.
 */
export const COURSES: Course[] = [
  {
    id: 'tlevel-digital',
    name: 'Developer Pathway — T Level',
    isTlevel: true,
    badge: '⚡',
    tagline: 'Digital Production, Design & Development',
    description:
      'The most industry-connected qualification Ada offers. A 2-year T Level equivalent to 3 A-Levels — including a 45-day paid work placement with a real tech company. You graduate with employer contacts, real experience, and up to 168 UCAS points.',
    careers: ['Software Developer', 'Web Engineer', 'Cybersecurity Analyst', 'Database Developer'],
    qualification: 'T Level in Digital Production, Design & Development',
    equivalent: '3 A-Levels (up to 168 UCAS points)',
    campus: 'Manchester',
    entryRequirement: 'Grade 5+ in English & Maths, Grade 6+ in Computer Science GCSE',
    url: 'https://www.ada.ac.uk/sixth-form/manchester-curriculum/',
    employerPartners: ['Bank of America', 'Booking.com', 'PwC', 'Siemens'],
    tLevelFacts: [
      'Worth up to 168 UCAS points — accepted by most UK universities',
      'Includes a mandatory 45-day industry work placement',
      'Partners include Bank of America, Booking.com, PwC and Siemens',
      'Equivalent to 3 A-Levels — not a lesser qualification',
      'Leads directly to degree apprenticeships or university',
    ],
    tlevelFaq: [
      {
        q: 'Will universities accept a T Level?',
        a: "Yes. Most UK universities accept T Levels, and Ada's T Level earns up to 168 UCAS points — the same as 3 A-Levels. A full list of accepting universities is available at tlevels.gov.uk.",
      },
      {
        q: 'Is it respected by employers?',
        a: "Ada's T Level partners include Bank of America, PwC, Booking.com and Siemens. Students complete a 45-day placement with a real company as part of the course.",
      },
      {
        q: 'What if they change their mind?',
        a: "T Level graduates can go to university, into work, or into a degree apprenticeship. It doesn't close any doors.",
      },
    ],
  },
  {
    id: 'apprenticeship',
    name: 'Degree Apprenticeship',
    isTlevel: false,
    badge: '💼',
    tagline: 'Earn while you learn — BSc Digital Technology Solutions',
    description:
      "Skip the tuition fees. Earn a full BSc while working for a top tech employer. Ada's degree apprenticeship programme pays a salary from day one, with training built around what employers actually need.",
    careers: ['Software Engineer', 'Solutions Architect', 'DevOps Engineer', 'Technical Lead'],
    qualification: 'BSc Digital Technology Solutions (Degree Apprenticeship)',
    equivalent: 'Full undergraduate degree',
    campus: 'Manchester',
    entryRequirement:
      'Typically post-18, after completing sixth form. Apply after a T Level or A-Levels.',
    url: 'https://www.ada.ac.uk/apprentices/',
    note: 'This is a post-18 pathway. Complete sixth form first, then apply.',
  },
  {
    id: 'btec-computing',
    name: 'BTEC Level 3 National Extended Diploma in Computing',
    isTlevel: false,
    badge: '💻',
    tagline: 'Software, systems & problem-solving',
    description:
      'A broad, coursework-led route into computing — programming, networks, databases and cyber security, assessed mostly through projects rather than exams. A classroom-based alternative to a T-Level, without its work-placement model.',
    careers: ['Software Developer', 'IT Technician', 'Games Programmer', 'Network Engineer'],
    qualification: 'BTEC Level 3 National Extended Diploma in Computing',
    equivalent: '3 A-Levels (up to 168 UCAS points)',
    entryRequirement:
      'Grade 4+ in 5 GCSEs including English, Maths and a science or numerate subject',
  },
  {
    id: 'creative-media',
    name: 'BTEC Level 3 National Extended Diploma in Creative Media Production',
    isTlevel: false,
    badge: '🎬',
    tagline: 'Video, design & digital storytelling',
    description:
      'A coursework-based route into media production — video, photography, animation and digital design, built around real briefs and a portfolio rather than final exams.',
    careers: ['Video Editor', 'Graphic Designer', 'Content Creator', 'Animator'],
    qualification: 'BTEC Level 3 National Extended Diploma in Creative Media Production',
    equivalent: '3 A-Levels (up to 168 UCAS points)',
    entryRequirement: 'Grade 4+ in 5 GCSEs including English, plus an interest in creative work',
  },
  {
    id: 'business-enterprise',
    name: 'BTEC Level 3 National Extended Diploma in Business',
    isTlevel: false,
    badge: '📈',
    tagline: 'Business, marketing & enterprise skills',
    description:
      'A broad grounding in how organisations actually work — marketing, finance, operations and enterprise — assessed through coursework and case studies rather than a single exam at the end.',
    careers: ['Marketing Assistant', 'Business Analyst', 'Entrepreneur', 'Operations Coordinator'],
    qualification: 'BTEC Level 3 National Extended Diploma in Business',
    equivalent: '3 A-Levels (up to 168 UCAS points)',
    entryRequirement: 'Grade 4+ in 5 GCSEs including English and Maths',
  },
];
