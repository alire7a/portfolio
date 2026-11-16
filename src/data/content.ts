// Single source of truth for all copy on the site — edit here, not in components.

export const profile = {
  name: 'Alireza Afshar',
  firstName: 'Alireza',
  lastName: 'Afshar',
  role: 'Senior Front-End Developer',
  tagline:
    'Fast, motion-rich front-ends with React, Three.js and GSAP.',
  current: { title: 'Front-End Lead', company: 'Dmazing Studio' },
  email: 'alire7a.a@gmail.com',
  github: 'https://github.com/alire7a',
  githubHandle: 'alire7a',
  cv: '/Alireza-Afshar-CV.pdf',
}

export const hero = {
  /** Hero statement, one entry per line; *word* renders in the italic serif. */
  headline: ['Interfaces', 'that *move*.'],
  /** Cycles after the role in the eyebrow. */
  specialties: ['React & Next.js', 'WebGL & GLSL', 'GSAP motion', 'Design systems', 'Data-dense UI'],
  /** Cycles in the "Shipped" column. */
  shipped: ['Iconly', 'Ozgar AI', 'Piqo Studio', 'Notify Me', 'Skale', 'Powerleaf'],
  experience: '7+ years · 2 awards',
}

export const about = {
  statement:
    'Seven years building product interfaces and interactive web experiences for distributed teams. I care about the details people feel but rarely notice: the easing of a transition, the weight of a type scale, a page that moves beautifully without costing a millisecond of load time.',
  stats: [
    { value: 7, suffix: '+', label: 'Years shipping front-end' },
    { value: 8, suffix: '', label: 'Selected launches' },
    { value: 2, suffix: '', label: 'Award-winning builds' },
    { value: 4, suffix: '', label: 'Years leading Iconly' },
  ],
  facts: [
    { label: 'Education', value: 'B.Sc. Computer Engineering' },
    { label: 'Languages', value: 'English (professional) · Persian (native)' },
  ],
}

export const skills = [
  {
    group: 'Core',
    items: ['React', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Component architecture', 'State management', 'REST APIs'],
  },
  {
    group: 'Animation & 3D',
    items: ['GSAP', 'Three.js', 'React Three Fiber', 'WebGL & GLSL', 'Framer Motion', 'Lenis', 'SVG animation', 'Scroll-driven interaction', 'Micro-interactions'],
  },
  {
    group: 'Styling & Systems',
    items: ['Tailwind CSS', 'SCSS', 'CSS Modules', 'Design systems', 'Design tokens', 'Responsive layout', 'Pixel-accurate Figma builds'],
  },
  {
    group: 'Performance & Quality',
    items: ['Core Web Vitals', 'Lighthouse', 'Bundle & asset optimisation', 'Lazy loading', 'Accessibility (WCAG)', 'Cross-browser QA'],
  },
  {
    group: 'Product',
    items: ['Dashboards', 'Data visualisation', 'Search & filtering at scale', 'Onboarding flows', 'Marketing sites', 'SEO fundamentals'],
  },
  {
    group: 'Collaboration',
    items: ['Front-end leadership', 'Code review', 'Mentoring', 'Design handoff', 'Agile', 'Remote teams'],
  },
  {
    group: 'Tools',
    items: ['Git', 'Figma', 'Webflow', 'Vercel', 'Vite', 'Storybook', 'Notion', 'Slack'],
  },
]

export const experience = [
  {
    period: 'Jun 2024 to Present',
    role: 'Front-End Lead',
    company: 'Dmazing Studio',
    points: [
      'Lead the front-end for Ozgar AI, an enterprise code-intelligence platform, covering product UI and the marketing site.',
      'Built data-dense interfaces for large legacy codebases: documentation views, ER and call diagrams, and search across thousands of code artifacts.',
      'Own dmazing.studio and set the front-end standard across client work: minimal builds, strong typography, tight performance budgets.',
      'Review code, define component architecture and work directly with designers from concept to launch.',
    ],
  },
  {
    period: 'Jun 2020 to Jun 2024',
    role: 'Front-End Developer',
    company: 'Piqo Studio',
    points: [
      'Led front-end on Iconly, one of the best-known icon packs in the world. Marketing site and web app with large-scale icon search, preview and export.',
      'Built piqo.studio, awarded in 2023 for design and performance: heavy motion with no cost to load time.',
      'Built Skale, an interactive site driven by animation and 3D web elements.',
      'Owned animation and 3D across studio projects and set the motion quality bar for client builds.',
    ],
  },
  {
    period: 'Alongside full-time roles',
    role: 'Front-End Developer',
    company: 'Muunect Studio & independent',
    points: [
      'Built the front-end for Notify Me (Best Value, Winter 2024): dashboard, onboarding and marketing pages.',
      'Delivered Powerleaf, a production commercial product site built for performance and clean responsive behaviour.',
      'Built the site for Kasra Design, an award-winning animation studio. A motion-heavy video showcase without hurting load performance.',
    ],
  },
]

export type Project = {
  name: string
  url: string
  display: string
  kind: string
  note?: string
  /** Gradient the WebGL particles shift to while this row is hovered. */
  tint: [string, string]
}

export const projects: Project[] = [
  { name: 'Iconly', url: 'https://iconly.pro', display: 'iconly.pro', kind: 'Marketing site & web app', note: 'Icon search, preview & export at scale', tint: ['#6c4dff', '#c8b8ff'] },
  { name: 'Ozgar AI', url: 'https://ozgar.ai', display: 'ozgar.ai', kind: 'Enterprise product UI & marketing', note: 'Code intelligence for legacy systems', tint: ['#1f8bff', '#9fe7ff'] },
  { name: 'Piqo Studio', url: 'https://piqo.studio', display: 'piqo.studio', kind: 'Studio site', note: 'Award for design & performance, 2023', tint: ['#ff5a36', '#ffd6a0'] },
  { name: 'Notify Me', url: 'https://notify-me.io', display: 'notify-me.io', kind: 'Dashboard, onboarding & marketing', note: 'Best Value, Winter 2024', tint: ['#11b5a4', '#c6f432'] },
  { name: 'Powerleaf', url: 'https://powerleaf.com', display: 'powerleaf.com', kind: 'Commercial product site', tint: ['#2fa84f', '#d9ffb0'] },
  { name: 'Skale', url: 'https://skale.space', display: 'skale.space', kind: 'Interactive 3D site', note: 'Animation & 3D-driven', tint: ['#ff3d8b', '#ffc2dc'] },
  { name: 'Dmazing Studio', url: 'https://dmazing.studio', display: 'dmazing.studio', kind: 'Studio site', tint: ['#e8e4dc', '#ffffff'] },
  { name: 'Kasra Design', url: 'https://kasradesign-web-client.vercel.app', display: 'Launching soon', kind: 'Motion-heavy studio portfolio', tint: ['#e0a43a', '#fff1c9'] },
]

export const awards = [
  { year: '2023', title: 'Piqo Studio', detail: 'Award for design and performance. Front-end built by me.' },
  { year: '2024', title: 'Notify Me', detail: 'Best Value, Winter 2024. Front-end built by me.' },
  { year: 'Ongoing', title: 'Iconly', detail: 'Recognised internationally as a leading icon library. I built the site and web app.' },
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]
