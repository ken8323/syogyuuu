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

  // 先手（あおチーム）: 画面下部・下側プレイヤー向けに 180° 回転
  // 後手（あかチーム）: 画面上部・通常向き
  const positionClass = isSente ? 'bottom-6' : 'top-6'
  const initialY = isSente ? 20 : -20

  return (
    <AnimatePresence>
      {player && (
        // 外側: 位置・フェード・スライドアニメーション（x は motion value で中央揃え）
        <motion.div
          className={`fixed left-1/2 ${positionClass} z-50`}
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: initialY }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: initialY }}
          transition={{ opacity: { duration: 0.25 }, y: { duration: 0.25 } }}
        >
          {/* 内側: 見た目・回転（CSS transform で Framer Motion と競合しない） */}
          <div
            className={`rounded-2xl ${bgColor} px-6 py-3 text-base font-bold text-white shadow-lg flex items-center gap-2`}
            style={isSente ? { transform: 'rotate(180deg)' } : undefined}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
