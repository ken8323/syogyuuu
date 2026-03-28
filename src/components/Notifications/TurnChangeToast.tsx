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

  // 先手（あおチーム）: iPad下側に座る → 画面下・回転なし（そのまま読める）
  // 後手（あかチーム）: iPad上側に座る → 画面上・180°回転（逆向きに座るため）
  const positionClass = isSente ? 'bottom-6' : 'top-6'
  const initialY = isSente ? 20 : -20

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className={`fixed left-1/2 ${positionClass} z-50`}
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: initialY }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: initialY }}
          transition={{ opacity: { duration: 0.25 }, y: { duration: 0.25 } }}
        >
          <div
            className={`rounded-2xl ${bgColor} px-6 py-3 text-base font-bold text-white shadow-lg flex items-center gap-2`}
            style={isSente ? undefined : { transform: 'rotate(180deg)' }}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
