import { create } from 'zustand';

export type AnimState = 'idle' | 'walking' | 'thinking' | 'sitting_typing';

interface GameStore {
  playerPos: [number, number, number];
  playerRot: number;
  animState: AnimState;
  atDesk: boolean;
  performanceTier: 'high' | 'medium' | 'low';
  setPlayerPos: (pos: [number, number, number]) => void;
  setPlayerRot: (rot: number) => void;
  setAnimState: (s: AnimState) => void;
  setAtDesk: (v: boolean) => void;
  setPerformanceTier: (t: 'high' | 'medium' | 'low') => void;
}

const useGameStore = create<GameStore>((set) => ({
  playerPos: [0, 0, 2],
  playerRot: 0,
  animState: 'idle',
  atDesk: false,
  performanceTier: 'high',
  setPlayerPos: (pos) => set({ playerPos: pos }),
  setPlayerRot: (rot) => set({ playerRot: rot }),
  setAnimState: (s) => set({ animState: s }),
  setAtDesk: (v) => set({ atDesk: v }),
  setPerformanceTier: (t) => set({ performanceTier: t }),
}));

export default useGameStore;
