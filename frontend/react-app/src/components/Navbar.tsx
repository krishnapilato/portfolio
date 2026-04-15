import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { usePortfolioStore } from '../store/usePortfolioStore'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const codexLevel = usePortfolioStore((s) => s.codexLevel)

  const navLinks = ['Skills', 'Story', 'Timeline']

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(10,10,10,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,247,255,0.1)',
        }}
      >
        {/* Logo */}
        <motion.a
          href="#"
          whileHover={{ scale: 1.05, rotateX: 8 }}
          className="text-xl font-bold tracking-widest"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#ff9f00', textShadow: '0 0 20px #ff9f0066' }}
        >
          JOK DAS
        </motion.a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-[#aaa] hover:text-[#00f7ff] transition-colors tracking-wider uppercase font-mono"
            >
              {link}
            </a>
          ))}
          <motion.a
            href="#hero"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-lg"
            style={{
              background: 'rgba(0,247,255,0.1)',
              color: '#00f7ff',
              border: '1px solid rgba(0,247,255,0.3)',
            }}
          >
            Enter the Codex
          </motion.a>
        </div>

        {/* Codex progress bar */}
        <div
          className="hidden md:block absolute bottom-0 left-0 h-[1px] bg-[#00f7ff] transition-all duration-500"
          style={{ width: `${codexLevel}%`, boxShadow: '0 0 8px #00f7ff' }}
        />

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#00f7ff]"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <button
              className="absolute top-6 right-6 text-[#ff00aa]"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
            <nav className="flex flex-col items-center gap-8">
              {[...navLinks, 'Enter the Codex'].map((link) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold uppercase tracking-widest text-white hover:text-[#00f7ff] transition-colors"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
