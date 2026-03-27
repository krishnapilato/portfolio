import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store';
import type { AnimState } from '../store';

const animLabels: Record<AnimState, string> = {
  idle:            '● IDLE',
  walking:         '▸ WALKING',
  sitting_typing:  '⌨ TYPING',
  thinking:        '◎ THINKING',
};

const animColors: Record<AnimState, string> = {
  idle:            '#00ddee',
  walking:         '#00ff99',
  sitting_typing:  '#ffaa00',
  thinking:        '#cc44ff',
};

const animIcons: Record<AnimState, string> = {
  idle:            '🧍',
  walking:         '🚶',
  sitting_typing:  '💻',
  thinking:        '🤔',
};

const wasdKeys = [
  { key: 'W', label: '▲', row: 0, col: 1 },
  { key: 'A', label: '◀', row: 1, col: 0 },
  { key: 'S', label: '▼', row: 1, col: 1 },
  { key: 'D', label: '▶', row: 1, col: 2 },
];

const glassPanel: React.CSSProperties = {
  background: 'rgba(0, 5, 20, 0.72)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: 8,
};

export default function HUD() {
  const animState = useGameStore((s) => s.animState);
  const tier      = useGameStore((s) => s.performanceTier);
  const atDesk    = useGameStore((s) => s.atDesk);
  const color     = animColors[animState];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: '"Courier New", Courier, monospace',
        zIndex: 10,
      }}
    >
      {/* ── Top-left: animation state ─────────────────────────────── */}
      <div style={{ position: 'absolute', top: 18, left: 18 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={animState}
            initial={{ opacity: 0, x: -14, scale: 0.92 }}
            animate={{ opacity: 1,  x: 0,   scale: 1 }}
            exit={{ opacity: 0,    x:  14,  scale: 0.92 }}
            transition={{ duration: 0.22 }}
            style={{
              ...glassPanel,
              border: `1px solid ${color}55`,
              padding: '10px 18px',
              boxShadow: `0 0 18px ${color}33, inset 0 0 8px ${color}11`,
              minWidth: 160,
            }}
          >
            <div style={{ fontSize: 9, color: '#3a4f6a', letterSpacing: 3, marginBottom: 4 }}>
              ANIM_STATE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{animIcons[animState]}</span>
              <motion.div
                animate={{ opacity: [1, 0.55, 1] }}
                transition={{ repeat: Infinity, duration: 2.4 }}
                style={{ fontSize: 14, fontWeight: 'bold', color, letterSpacing: 2 }}
              >
                {animLabels[animState]}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* At-desk badge */}
        <AnimatePresence>
          {atDesk && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1,  y:  0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                ...glassPanel,
                marginTop: 8,
                border: '1px solid #ffaa0066',
                padding: '6px 14px',
                fontSize: 11,
                color: '#ffaa00',
                letterSpacing: 2,
                boxShadow: '0 0 12px #ffaa0033',
              }}
            >
              ◉ AT WORKSTATION
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Top-right: GPU tier ───────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          ...glassPanel,
          border: '1px solid #1a2a3a',
          padding: '8px 14px',
          textAlign: 'right',
        }}
      >
        <div style={{ fontSize: 9, color: '#2a3f55', letterSpacing: 3 }}>GPU_TIER</div>
        <div
          style={{
            fontSize: 14,
            letterSpacing: 3,
            color: tier === 'high' ? '#00ff99' : tier === 'medium' ? '#ffaa00' : '#ff4455',
            fontWeight: 'bold',
          }}
        >
          {tier.toUpperCase()}
        </div>
      </div>

      {/* ── Bottom-right: WASD controls ───────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          right: 22,
          ...glassPanel,
          border: '1px solid #0a1a2a',
          padding: '14px 20px',
          boxShadow: '0 0 20px #00ffff18',
        }}
      >
        <div style={{ fontSize: 9, color: '#2a3f55', letterSpacing: 3, marginBottom: 12, textAlign: 'center' }}>
          MOVEMENT
        </div>

        <div style={{ position: 'relative', width: 96, height: 60 }}>
          {wasdKeys.map(({ key, label, row, col }) => (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: col * 32,
                top:  row * 30,
                width: 28,
                height: 26,
                background: 'rgba(0, 20, 44, 0.85)',
                border: '1px solid #00ffff33',
                borderBottom: '2px solid #00ffff55',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              <span style={{ fontSize: 10, color: '#00ffff', fontWeight: 'bold', lineHeight: 1 }}>{label}</span>
              <span style={{ fontSize: 7, color: '#334455', lineHeight: 1 }}>{key}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, fontSize: 9, color: '#2a3f55', letterSpacing: 1, textAlign: 'center' }}>
          WALK TO DESK → SIT
        </div>
      </div>

      {/* ── Bottom-left: system strip ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 22,
          left: 22,
          ...glassPanel,
          border: '1px solid #0a1222',
          padding: '10px 16px',
          boxShadow: '0 0 14px #0000ff18',
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ repeat: Infinity, duration: 3.8 }}
          style={{ fontSize: 11, color: '#00ddee', letterSpacing: 2, marginBottom: 4 }}
        >
          ▸ DEV_ROOM  v1.0
        </motion.div>
        <div style={{ fontSize: 9, color: '#1a2d3f', letterSpacing: 1 }}>
          Three.js · Rapier · React 19
        </div>
      </motion.div>
    </div>
  );
}
