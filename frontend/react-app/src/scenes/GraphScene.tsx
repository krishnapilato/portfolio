import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import content from '../data/content.json'

interface Node {
  id: string
  label: string
  x: number
  y: number
}

interface GraphSceneProps {
  isVisible: boolean
}

export function GraphScene({ isVisible }: GraphSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const { nodes: rawNodes, edges } = content.systemThinking

  useEffect(() => {
    if (!isVisible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let startTime: number | null = null

    const getSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      return { w: rect?.width ?? 600, h: rect?.height ?? 400 }
    }

    const resize = () => {
      const { w, h } = getSize()
      canvas.width = w
      canvas.height = h
    }
    resize()

    const nodes: Node[] = rawNodes.map(n => ({
      ...n,
      x: n.x * (canvas.width),
      y: n.y * (canvas.height),
    }))

    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    const animate = (ts: number) => {
      if (!startTime) startTime = ts
      const elapsed = (ts - startTime) / 1000
      const p = Math.min(elapsed / 2, 1)

      const { w, h } = getSize()
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        nodes.forEach((n, i) => {
          n.x = rawNodes[i].x * w
          n.y = rawNodes[i].y * h
        })
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      edges.forEach(([fromId, toId], i) => {
        const from = nodeMap.get(fromId)
        const to = nodeMap.get(toId)
        if (!from || !to) return
        const edgeProgress = Math.min(Math.max((p * edges.length - i), 0), 1)
        if (edgeProgress <= 0) return

        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
        gradient.addColorStop(0, `rgba(0, 245, 255, ${0.4 * edgeProgress})`)
        gradient.addColorStop(1, `rgba(123, 0, 255, ${0.4 * edgeProgress})`)

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(
          from.x + (to.x - from.x) * edgeProgress,
          from.y + (to.y - from.y) * edgeProgress
        )
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.stroke()

        // Pulse dot
        if (edgeProgress > 0.5) {
          const pulseProg = ((elapsed * 0.5 + i * 0.3) % 1)
          const px = from.x + (to.x - from.x) * pulseProg
          const py = from.y + (to.y - from.y) * pulseProg
          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 245, 255, 0.8)'
          ctx.fill()
        }
      })

      // Draw nodes
      nodes.forEach((node, i) => {
        const nodeProgress = Math.min(Math.max((p * nodes.length - i * 0.5), 0), 1)
        if (nodeProgress <= 0) return

        const radius = 24 * nodeProgress
        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2)
        grd.addColorStop(0, `rgba(0, 245, 255, ${0.15 * nodeProgress})`)
        grd.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.8 * nodeProgress})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = `rgba(0, 0, 0, ${0.9 * nodeProgress})`
        ctx.fill()

        // Label
        if (nodeProgress > 0.5) {
          ctx.font = `${Math.round(10 * nodeProgress)}px Inter, sans-serif`
          ctx.fillStyle = `rgba(232, 232, 232, ${(nodeProgress - 0.5) * 2})`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(node.label, node.x, node.y)
        }
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [isVisible, edges, rawNodes])

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  )
}
