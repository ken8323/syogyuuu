'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Player } from '@/lib/shogi/types'

interface TurnChangeToastProps {
  player: Player | null
  onDismiss: () => void
}

export function TurnChangeToast({ player, onDismiss }: TurnChangeToastProps) {
  useEffect(() => {
    if (!player) return
    const timer = setTimeout(onDismiss, 1500)
    return () => clearTimeout(timer)
  }, [player, onDismiss])

  const isSente = player === 'sente'
  const bgColor = isSente ? 'bg-blue-500' : 'bg-red-500'
  const label = isSente ? 'あおチームのばんだよ！' : 'あかチームのばんだよ！'
  const emoji = isSente ? '🔵' : '🔴'

  // 先手（あおチーム）は画面下・180度回転（向かい合って遊ぶため）
  // 後手（あかチーム）は画面上・通常向き
  const positionClass = isSente ? 'bottom-6' : 'top-6'
  const rotateStyle = isSente ? { rotate: 180 } : {}
  const initialY = isSente ? 20 : -20
  const exitY = isSente ? 20 : -20

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className={`fixed left-1/2 ${positionClass} z-50 -translate-x-1/2 rounded-2xl ${bgColor} px-6 py-3 text-base font-bold text-white shadow-lg flex items-center gap-2`}
          style={rotateStyle}
          initial={{ opacity: 0, y: initialY }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: exitY }}
          transition={{ opacity: { duration: 0.25 }, y: { duration: 0.25 } }}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
