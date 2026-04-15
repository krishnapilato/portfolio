import { motion } from 'framer-motion'
import { ExternalLink, Share2, GitFork } from 'lucide-react'

export function Footer() {
  const links = [
    { icon: GitFork, href: 'https://github.com', label: 'GitHub' },
    { icon: Share2, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: ExternalLink, href: 'https://x.com', label: 'X' },
  ]

  return (
    <footer
      className="py-16 px-6 text-center border-t"
      style={{ borderColor: 'rgba(0,247,255,0.1)', background: 'rgba(10,10,10,0.9)' }}
    >
      <div className="flex justify-center gap-6 mb-8">
        {links.map(({ icon: Icon, href, label }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            whileHover={{ scale: 1.2, color: '#00f7ff' }}
            whileTap={{ scale: 0.9 }}
            className="text-[#666] transition-colors"
          >
            <Icon size={22} />
          </motion.a>
        ))}
      </div>
      <p className="text-[#444] text-sm font-mono mb-2">
        Made with React 19.2 + Three.js + pure coffee ☕
      </p>
      <p className="text-[#333] text-xs font-mono">
        © 2026 Jok Das — All rights reserved. Level up. 🎮
      </p>
    </footer>
  )
}
