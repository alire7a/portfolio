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
  telegram: 'https://t.me/Alir7a',
  telegramHandle: '@Alir7a',
  cv: '/Alireza-Afshar-CV.pdf',
}

export const hero = {
  /** Hero statement, one entry per line; *word* renders in the italic serif. */
  headline: ['Interfaces', 'that *move*.'],
  /** Cycles after the role in the eyebrow. */
  specialties: ['React & Next.js', 'WebGL & GLSL', 'GSAP motion', 'Design systems', 'Data-dense UI'],
  /** Cycles in the "Shipped" column. */
  shipped: ['Iconly', 'Ozgar AI', 'Piqo Studio', 'Notify Me', 'Skale', 'Powerleaf'],
  experience: '7+ years · 10+ launches',
}

export const about = {
  statement:
    'Seven years building product interfaces and interactive web experiences for distributed teams. I care about the details people feel but rarely notice: the easing of a transition, the weight of a type scale, a page that moves beautifully without costing a millisecond of load time.',
  stats: [
    { value: 7, suffix: '+', label: 'Years shipping front-end' },
    { value: 10, suffix: '+', label: 'Project launches' },
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
      'Built Powerleaf, a commercial product site in Webflow, tuned for performance and clean responsive behaviour.',
      'Review code, define component architecture and work directly with designers from concept to launch.',
    ],
  },
  {
    period: 'Jun 2020 to Jun 2024',
    role: 'Front-End Developer',
    company: 'Piqo Studio',
    points: [
      'Led front-end on Iconly, a library of 40,000+ flat, animated and 3D icons. Marketing site and web app with large-scale icon search, preview and export.',
      'Built piqo.studio: heavy motion and 3D with no cost to load time.',
      'Built Skale, an interactive site driven by animation and 3D web elements.',
      'Owned animation and 3D across studio projects and set the motion quality bar for client builds.',
    ],
  },
  {
    period: 'Alongside full-time roles',
    role: 'Freelance Developer',
    points: [
      'Part-time front-end work with Muunect Studio: dashboards, onboarding flows and marketing pages for client products.',
      'Freelance builds for independent clients, from commercial product sites to motion-heavy portfolios.',
      'Same bar as my full-time work: pixel-accurate builds, tight performance budgets and clean handoff.',
    ],
  },
  {
    period: 'Ongoing',
    role: 'Experimental projects',
    points: [
      'Building experimental web apps and native apps to try new ideas, tools and interaction patterns.',
      'My playground for new frameworks, AI workflows and motion techniques before they reach client work.',
    ],
  },
]

export const aiWorkflow = {
  intro:
    'I build with AI every day. It handles the scaffolding, refactors and first drafts, so ideas reach production in days, not weeks, and my hours go into motion, performance and polish.',
  tools: ['Claude', 'Claude Code', 'ChatGPT', 'Cursor'],
  steps: [
    {
      title: 'Prototype in hours',
      detail: 'From a Figma file or a rough brief to a working build the same day. Ideas get tested on screen, not in meetings.',
    },
    {
      title: 'Review every line',
      detail: 'AI writes the first draft, I own the result. Every change is read, typed and tested before it ships.',
    },
    {
      title: 'Spend the time on craft',
      detail: 'Less boilerplate means more time for the easing, the type and the load budget: the details people feel.',
    },
  ],
}

export type Project = {
  name: string
  url: string
  display: string
  kind: string
  stack: 'Next.js' | 'React' | 'Webflow'
  note?: string
  /** Gradient the WebGL particles shift to while this row is hovered. */
  tint: [string, string]
}

export const projects: Project[] = [
  { name: 'Dmazing Studio', url: 'https://dmazing.studio', display: 'dmazing.studio', kind: 'Studio site', stack: 'Next.js', tint: ['#e8e4dc', '#ffffff'] },
  { name: 'Iconly Web App', url: 'https://web.iconly.pro', display: 'web.iconly.pro', kind: 'Icon dashboard', stack: 'React', note: 'Browse, customise & ship icons', tint: ['#3d5afe', '#b8c4ff'] },
  { name: 'Iconly', url: 'https://iconly.pro', display: 'iconly.pro', kind: 'Product landing page', stack: 'Next.js', note: 'Marketing site for the Iconly web app', tint: ['#6c4dff', '#c8b8ff'] },
  { name: 'Ozgar AI', url: 'https://ozgar.ai', display: 'ozgar.ai', kind: 'Enterprise product UI & marketing', stack: 'Next.js', note: 'Code intelligence for legacy systems', tint: ['#1f8bff', '#9fe7ff'] },
  { name: 'Piqo Studio', url: 'https://piqo.studio', display: 'piqo.studio', kind: 'Studio site', stack: 'Next.js', tint: ['#ff5a36', '#ffd6a0'] },
  { name: 'Notify Me', url: 'https://notify-me.io', display: 'notify-me.io', kind: 'Dashboard, onboarding & marketing', stack: 'Webflow', note: 'Shopify back-in-stock & preorder app', tint: ['#11b5a4', '#c6f432'] },
  { name: 'Powerleaf', url: 'https://powerleaf.com', display: 'powerleaf.com', kind: 'Commercial product site', stack: 'Webflow', tint: ['#2fa84f', '#d9ffb0'] },
  { name: 'Skale', url: 'https://skale.space', display: 'skale.space', kind: 'Interactive 3D site', stack: 'Webflow', note: 'Animation & 3D-driven', tint: ['#ff3d8b', '#ffc2dc'] },
  { name: 'Kasra Design', url: 'https://kasradesign-web-client.vercel.app', display: 'Launching soon', kind: 'Motion-heavy studio portfolio', stack: 'Next.js', tint: ['#e0a43a', '#fff1c9'] },
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]
