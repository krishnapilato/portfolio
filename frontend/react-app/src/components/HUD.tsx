import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store';
import type { AnimState } from '../store';

const animLabels: Record<AnimState, string> = {
  idle: 'IDLE',
  walking: 'WALKING',
  sitting_typing: 'TYPING',
  thinking: 'THINKING',
};

const animColors: Record<AnimState, string> = {
  idle: '#00ffff',
  walking: '#00ff88',
  sitting_typing: '#ffaa00',
  thinking: '#aa00ff',
};

const wasdKeys = [
  { key: 'W', label: '↑', row: 0, col: 1 },
  { key: 'A', label: '←', row: 1, col: 0 },
  { key: 'S', label: '↓', row: 1, col: 1 },
  { key: 'D', label: '→', row: 1, col: 2 },
];

export default function HUD() {
  const animState = useGameStore((s) => s.animState);
  const tier = useGameStore((s) => s.performanceTier);
  const atDesk = useGameStore((s) => s.atDesk);
  const color = animColors[animState];

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
      {/* Top-left: animation state badge */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={animState}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(0,0,0,0.65)',
              border: `1px solid ${color}`,
              borderRadius: 6,
              padding: '8px 16px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: `0 0 12px ${color}55`,
            }}
          >
            <div style={{ fontSize: 10, color: '#668', letterSpacing: 2, marginBottom: 2 }}>
              ANIM_STATE
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: 18, fontWeight: 'bold', color, letterSpacing: 3 }}
            >
              {animLabels[animState]}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* At-desk indicator */}
        <AnimatePresence>
          {atDesk && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{
                marginTop: 8,
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid #ffaa00',
                borderRadius: 6,
                padding: '6px 14px',
                backdropFilter: 'blur(8px)',
                fontSize: 11,
                color: '#ffaa00',
                letterSpacing: 2,
                boxShadow: '0 0 10px #ffaa0055',
              }}
            >
              ◉ AT WORKSTATION
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top-right: performance tier */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid #334',
          borderRadius: 6,
          padding: '6px 12px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ fontSize: 10, color: '#556', letterSpacing: 2 }}>GPU TIER</div>
        <div style={{ fontSize: 13, color: tier === 'high' ? '#00ff88' : tier === 'medium' ? '#ffaa00' : '#ff4444', letterSpacing: 2 }}>
          {tier.toUpperCase()}
        </div>
      </div>

      {/* Bottom-right: WASD control guide */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid #224',
          borderRadius: 8,
          padding: '14px 18px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 0 16px #00ffff22',
        }}
      >
        <div style={{ fontSize: 10, color: '#556', letterSpacing: 3, marginBottom: 10, textAlign: 'center' }}>
          CONTROLS
        </div>

        {/* WASD key grid */}
        <div style={{ position: 'relative', width: 90, height: 56 }}>
          {wasdKeys.map(({ key, label, row, col }) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.1 }}
              style={{
                position: 'absolute',
                left: col * 30,
                top: row * 28,
                width: 26,
                height: 24,
                background: 'rgba(0,20,40,0.8)',
                border: '1px solid #00ffff44',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                color: '#00ffff',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {label}
            </motion.div>
          ))}
          {/* Key labels overlay */}
          {wasdKeys.map(({ key, row, col }) => (
            <div
              key={`lbl-${key}`}
              style={{
                position: 'absolute',
                left: col * 30 + 1,
                top: row * 28 + 14,
                fontSize: 7,
                color: '#334',
                width: 26,
                textAlign: 'center',
                letterSpacing: 0,
              }}
            >
              {key}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, fontSize: 10, color: '#446', letterSpacing: 1, textAlign: 'center' }}>
          APPROACH DESK TO SIT
        </div>
      </div>

      {/* Bottom-left: system info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid #113',
          borderRadius: 6,
          padding: '8px 14px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          style={{ fontSize: 10, color: '#00ffff', letterSpacing: 2 }}
        >
          ▸ DEV_ROOM v1.0
        </motion.div>
        <div style={{ fontSize: 9, color: '#334', letterSpacing: 1, marginTop: 2 }}>
          Three.js · React · Rapier
        </div>
      </motion.div>
    </div>
  );
}
