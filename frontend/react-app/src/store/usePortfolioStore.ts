import { create } from 'zustand'

export interface SkillCard {
  id: string
  label: string
  color: string
  description: string
  lore: string
}

interface PortfolioStore {
  codexLevel: number
  activeSkill: SkillCard | null
  modalOpen: boolean
  confettiTriggered: boolean
  addCodexProgress: (amount: number) => void
  openSkillModal: (skill: SkillCard) => void
  closeSkillModal: () => void
  triggerConfetti: () => void
}

export const SKILL_CARDS: SkillCard[] = [
  {
    id: 'java',
    label: 'Java',
    color: '#ff9f00',
    description: 'Core Language',
    lore: 'The ancient tongue of enterprise. With Java, Jok architects systems that scale to millions—Spring Boot microservices, reactive streams, and blazing JVM performance.',
  },
  {
    id: 'spring',
    label: 'Spring Boot',
    color: '#6db33f',
    description: 'Backend Framework',
    lore: "A force multiplier for Java. REST APIs, OAuth2 security, WebSockets, and cloud-native deployments—Spring Boot is Jok's weapon of choice for the backend.",
  },
  {
    id: 'react',
    label: 'React 19',
    color: '#00f7ff',
    description: 'Frontend Library',
    lore: "The UI frontier. Server Components, concurrent rendering, use() hooks—Jok harnesses React 19's full power to craft interfaces that feel alive.",
  },
  {
    id: 'postgres',
    label: 'PostgreSQL',
    color: '#336791',
    description: 'Database',
    lore: 'The relational titan. Complex queries, JSON columns, full-text search—Jok designs schemas that stand the test of time and traffic.',
  },
  {
    id: 'docker',
    label: 'Docker',
    color: '#2496ed',
    description: 'Containerization',
    lore: 'Shipping code as hermetic packages. Every service containerized, every deployment reproducible. Jok runs the same container in dev, staging, and production.',
  },
  {
    id: 'k8s',
    label: 'Kubernetes',
    color: '#ff00aa',
    description: 'Orchestration',
    lore: "The galaxy-brain of infra. Auto-scaling, rolling deployments, service meshes—Jok orchestrates entire microservice fleets with a single manifest.",
  },
  {
    id: 'microservices',
    label: 'Microservices',
    color: '#aaff00',
    description: 'Architecture',
    lore: "Divide to conquer. Domain-driven boundaries, event sourcing, saga patterns—Jok's architectures decompose monoliths into resilient, composable services.",
  },
]

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  codexLevel: 0,
  activeSkill: null,
  modalOpen: false,
  confettiTriggered: false,
  addCodexProgress: (amount) =>
    set((state) => {
      const next = Math.min(100, state.codexLevel + amount)
      return {
        codexLevel: next,
        confettiTriggered: next >= 100 && !state.confettiTriggered ? true : state.confettiTriggered,
      }
    }),
  openSkillModal: (skill) =>
    set({ activeSkill: skill, modalOpen: true }),
  closeSkillModal: () =>
    set({ activeSkill: null, modalOpen: false }),
  triggerConfetti: () => set({ confettiTriggered: true }),
}))
