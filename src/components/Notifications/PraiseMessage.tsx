'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PraiseMessageProps {
  message: string | null
  onDismiss: () => void
}

export function PraiseMessage({ message, onDismiss }: PraiseMessageProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 1000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 1.15, 1.0] }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            scale: { type: 'spring', stiffness: 400, damping: 18 },
            opacity: { duration: 0.15 },
          }}
        >
          <span
            className="text-3xl font-bold text-yellow-400 select-none"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(251,191,36,0.6)',
            }}
          >
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
