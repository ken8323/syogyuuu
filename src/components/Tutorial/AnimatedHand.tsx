'use client'

import { motion } from 'framer-motion'
import { useLayoutEffect, useState } from 'react'

interface AnimatedHandProps {
  targetRow: number
  targetCol: number
  boardRef: React.RefObject<HTMLDivElement>
  squareSize: number
}

export function AnimatedHand({
  targetRow,
  targetCol,
  boardRef,
  squareSize,
}: AnimatedHandProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    const recalculate = () => {
      if (!boardRef.current) return
      const boardRect = boardRef.current.getBoundingClientRect()
      const x = boardRect.left + targetCol * squareSize + squareSize / 2
      const y = boardRect.top + targetRow * squareSize + squareSize / 2
      setPosition({ x, y })
    }

    recalculate()
    window.addEventListener('resize', recalculate)
    return () => window.removeEventListener('resize', recalculate)
  }, [targetRow, targetCol, boardRef, squareSize])

  if (!position) return null

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 55,
        pointerEvents: 'none',
      }}
      animate={{ y: [0, -10, 0] }}
      transition={{
        repeat: Infinity,
        duration: 0.8,
        ease: 'easeInOut',
      }}
      className="text-3xl"
    >
      👆
    </motion.div>
  )
}
