'use client'

import { motion } from 'framer-motion'

interface SuccessEffectProps {
  show: boolean
  onComplete: () => void
}

const PARTICLE_COUNT = 8
const SPREAD = 120

const getSpread = (index: number) => {
  const angle = (index / PARTICLE_COUNT) * 2 * Math.PI
  return {
    x: Math.cos(angle) * SPREAD,
    y: Math.sin(angle) * SPREAD,
  }
}

export function SuccessEffect({ show, onComplete }: SuccessEffectProps) {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 70,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const { x, y } = getSpread(i)
        const isLast = i === PARTICLE_COUNT - 1
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
            }}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{ scale: 2, opacity: 0, x, y }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onAnimationComplete={isLast ? onComplete : undefined}
          >
            ✦
          </motion.div>
        )
      })}
    </div>
  )
}
