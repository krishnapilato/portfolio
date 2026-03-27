import { Vector3 } from 'three'
import { type ZoneId } from '../store/gameStore'

export type ZoneConfig = {
  id: ZoneId
  label: string
  position: [number, number, number]
  color: string
  accent: string
}

export const ZONES: ZoneConfig[] = [
  {
    id: 'projects',
    label: 'Projects Station',
    position: [0, 0, -40],
    color: '#60a5fa',
    accent: '#38bdf8',
  },
  {
    id: 'experience',
    label: 'Experience Satellite',
    position: [32, 2, 18],
    color: '#f472b6',
    accent: '#fb7185',
  },
  {
    id: 'skills',
    label: 'Skills Planet',
    position: [-28, -1, 26],
    color: '#fbbf24',
    accent: '#fde047',
  },
  {
    id: 'contact',
    label: 'Runway Planet',
    position: [-35, 0, -6],
    color: '#34d399',
    accent: '#2dd4bf',
  },
]

export const getZoneVector = (id: ZoneId) => {
  const zone = ZONES.find((z) => z.id === id)
  return zone ? new Vector3(...zone.position) : new Vector3()
}
