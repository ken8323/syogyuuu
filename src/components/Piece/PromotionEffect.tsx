'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Position } from '@/lib/shogi/types'

// ============================================================
// パーティクル設定
// ============================================================

const PARTICLE_COUNT = 10
const PARTICLE_COLORS = ['#F59E0B', '#FCD34D', '#FBBF24', '#F97316', '#FDE68A']

function getParticleProps(index: number, radius: number) {
  const angle = (index / PARTICLE_COUNT) * 2 * Math.PI
  const distance = radius * (0.8 + Math.random() * 0.4)
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  }
}

// ============================================================
// Props
// ============================================================

interface PromotionEffectProps {
  position: Position
  squareSize: { w: number; h: number }
  isForcedPromote: boolean
  onComplete: () => void
}

// ============================================================
// コンポーネント
// ============================================================

export function PromotionEffect({
  position,
  squareSize,
  isForcedPromote,
  onComplete,
}: PromotionEffectProps) {
  const { w, h } = squareSize
  const centerX = position.col * w + w / 2
  const centerY = position.row * h + h / 2
  const radius = (w + h) / 4

  // 通常成り: 1.0s、強制成り: 0.5s
  const duration = isForcedPromote ? 0.5 : 1.0
  const flashDelay = isForcedPromote ? 0 : 0.3
  const particleDelay = isForcedPromote ? 0.15 : 0.5

  // アニメーション完了タイマー
  useEffect(() => {
    const timer = setTimeout(onComplete, duration * 1000)
    return () => clearTimeout(timer)
  }, [duration, onComplete])

  // パーティクルの位置はマウント時に固定（再レンダーで変化しない）
  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, (_, i) => getParticleProps(i, radius)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 30,
        overflow: 'hidden',
      }}
    >
      {/* 白いフラッシュ */}
      <motion.div
        style={{
          position: 'absolute',
          left: centerX - w / 2,
          top: centerY - h / 2,
          width: w,
          height: h,
          borderRadius: '50%',
          background: 'white',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.4, 1.0] }}
        transition={{
          delay: flashDelay,
          duration: isForcedPromote ? 0.3 : 0.2,
          times: [0, 0.5, 1],
          ease: 'easeOut',
        }}
      />

      {/* 金色のパーティクル */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: centerX - 5,
            top: centerY - 5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{
            delay: particleDelay + i * 0.02,
            duration: duration - particleDelay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* ★バッジポップイン（通常成りのみ） */}
      {!isForcedPromote && (
        <motion.div
          style={{
            position: 'absolute',
            left: centerX + w * 0.15,
            top: centerY - h * 0.5,
            fontSize: h * 0.3,
            lineHeight: 1,
          }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.55,
            type: 'spring',
            stiffness: 500,
            damping: 18,
          }}
        >
          ⭐
        </motion.div>
      )}
    </div>
  )
}
