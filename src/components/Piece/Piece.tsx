'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import type { Piece as PieceType, PieceType as PieceTypeEnum, PromotedPieceType } from '@/lib/shogi/types'
import type { AnimalColors } from './animals'
import { PIECE_CONFIG, isPromotedType } from './pieceConfig'

// 先手: 青系 / 後手: 赤系
const SENTE_COLORS: AnimalColors = { primary: '#3B82F6', dark: '#1E40AF' }
const GOTE_COLORS: AnimalColors = { primary: '#EF4444', dark: '#991B1B' }

// 将棋駒の五角形（上部が尖った形）
const PIECE_CLIP_PATH = 'polygon(50% 0%, 100% 22%, 100% 100%, 0% 100%, 0% 22%)'

// 駒種別アイドルアニメーション設定
// intervalMs: アニメーション発火間隔（ランダムジッターを加算）
interface IdleAnimationConfig {
  intervalMs: number
  variants: Variants
  duration: number
}

const IDLE_ANIMATION_CONFIG: Partial<Record<PieceTypeEnum | PromotedPieceType, IdleAnimationConfig>> = {
  // ライオン（王）: ゆったりと左右に首を振る
  king: {
    intervalMs: 30000,
    duration: 1.2,
    variants: {
      idle: { rotate: 0 },
      animating: {
        rotate: [0, -8, 8, -5, 5, 0],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  },
  // 鷹（飛車）: 翼を2回パタパタ
  rook: {
    intervalMs: 25000,
    duration: 0.8,
    variants: {
      idle: { scaleX: 1 },
      animating: {
        scaleX: [1, 1.12, 0.92, 1.12, 0.92, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  },
  // フクロウ（角）: 首をかしげる
  bishop: {
    intervalMs: 20000,
    duration: 1.0,
    variants: {
      idle: { rotate: 0 },
      animating: {
        rotate: [0, 12, -12, 8, 0],
        transition: { duration: 1.0, ease: 'easeInOut' },
      },
    },
  },
  // ゾウ（金）: ゆっくり上下に揺れる
  gold: {
    intervalMs: 25000,
    duration: 1.4,
    variants: {
      idle: { y: 0 },
      animating: {
        y: [0, -5, 2, -3, 0],
        transition: { duration: 1.4, ease: 'easeInOut' },
      },
    },
  },
  // オオカミ（銀）: 素早く左右にシェイク（耳ピクピク表現）
  silver: {
    intervalMs: 20000,
    duration: 0.6,
    variants: {
      idle: { x: 0 },
      animating: {
        x: [0, -4, 4, -3, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  },
  // うさぎ（桂）: ぴょんと跳ねる
  knight: {
    intervalMs: 15000,
    duration: 0.7,
    variants: {
      idle: { y: 0 },
      animating: {
        y: [0, -8, 0, -5, 0],
        transition: { duration: 0.7, ease: 'easeOut' },
      },
    },
  },
  // イノシシ（香）: 前後に勢いよく頷く
  lance: {
    intervalMs: 25000,
    duration: 0.7,
    variants: {
      idle: { rotateX: 0 },
      animating: {
        y: [0, 3, -3, 3, 0],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
  },
  // ひよこ（歩）: つんつん（前傾姿勢）
  pawn: {
    intervalMs: 15000,
    duration: 0.6,
    variants: {
      idle: { rotate: 0, y: 0 },
      animating: {
        rotate: [0, 15, 0, 10, 0],
        y: [0, 3, 0, 2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  },
  // ニワトリ（と金）: コッコッと体を左右に揺らす
  promoted_pawn: {
    intervalMs: 20000,
    duration: 0.8,
    variants: {
      idle: { x: 0 },
      animating: {
        x: [0, -5, 5, -4, 4, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  },
  // 竜王（promoted_rook）: 翼をダイナミックに広げる
  promoted_rook: {
    intervalMs: 25000,
    duration: 1.0,
    variants: {
      idle: { scaleX: 1 },
      animating: {
        scaleX: [1, 1.15, 0.9, 1.15, 1],
        transition: { duration: 1.0, ease: 'easeInOut' },
      },
    },
  },
  // 竜馬（promoted_bishop）: ゆったり首かしげ
  promoted_bishop: {
    intervalMs: 20000,
    duration: 1.0,
    variants: {
      idle: { rotate: 0 },
      animating: {
        rotate: [0, 10, -10, 6, 0],
        transition: { duration: 1.0, ease: 'easeInOut' },
      },
    },
  },
  // 成銀: 素早くシェイク
  promoted_silver: {
    intervalMs: 20000,
    duration: 0.6,
    variants: {
      idle: { x: 0 },
      animating: {
        x: [0, -4, 4, -3, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  },
  // 成桂: ぴょんと跳ねる
  promoted_knight: {
    intervalMs: 15000,
    duration: 0.7,
    variants: {
      idle: { y: 0 },
      animating: {
        y: [0, -8, 0, -5, 0],
        transition: { duration: 0.7, ease: 'easeOut' },
      },
    },
  },
  // 成香: 前後に頷く
  promoted_lance: {
    intervalMs: 25000,
    duration: 0.7,
    variants: {
      idle: { y: 0 },
      animating: {
        y: [0, 3, -3, 3, 0],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
  },
}

/**
 * アイドルアニメーションフック
 * intervalMs ごとにランダムなジッターを加えてアニメーションを発火する。
 * 選択中 (isActive=false) はアニメーションしない。
 */
function useIdleAnimation(
  pieceType: PieceTypeEnum | PromotedPieceType,
  isActive: boolean,
  staggerDelay: number,
) {
  const config = IDLE_ANIMATION_CONFIG[pieceType]
  const [animState, setAnimState] = useState<'idle' | 'animating'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!config || !isActive) {
      setAnimState('idle')
      return
    }

    const schedule = () => {
      const jitter = Math.random() * config.intervalMs * 0.4
      timerRef.current = setTimeout(() => {
        setAnimState('animating')
      }, config.intervalMs + jitter)
    }

    // 初回はスタッガーディレイを付けて全駒が同時に動かないようにする
    timerRef.current = setTimeout(() => {
      schedule()
    }, staggerDelay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // isActive が変わった時だけ再スケジュール
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pieceType])

  const onAnimationComplete = () => {
    if (!config || !isActive) return
    setAnimState('idle')
    // 次のアニメーションをスケジュール
    const jitter = Math.random() * config.intervalMs * 0.4
    timerRef.current = setTimeout(() => {
      if (isActive) setAnimState('animating')
    }, config.intervalMs + jitter)
  }

  return { animState, onAnimationComplete }
}

interface PieceProps {
  piece: PieceType
  /** 選択中: 光彩 + バウンスアニメーション */
  isSelected?: boolean
  /** 相手の駒: 180度回転表示 */
  isOpponent?: boolean
  /** アイドルアニメーションのスタッガーディレイ（ms）。デフォルト0 */
  idleStaggerDelay?: number
}

export function Piece({ piece, isSelected = false, isOpponent = false, idleStaggerDelay = 0 }: PieceProps) {
  const config = PIECE_CONFIG[piece.type]
  const promoted = isPromotedType(piece.type)
  const isSente = piece.owner === 'sente'
  const colors = isSente ? SENTE_COLORS : GOTE_COLORS

  const { AnimalComponent, hiragana } = config

  // 背景色
  const bgClass = isSente ? 'bg-blue-50' : 'bg-red-50'

  // clip-path 使用時は ring が効かないため drop-shadow で枠線を表現
  const borderShadow = promoted
    ? 'drop-shadow(0 0 2px #F59E0B) drop-shadow(0 0 2px #F59E0B)'
    : isSente
      ? 'drop-shadow(0 0 1.5px #93C5FD)'
      : 'drop-shadow(0 0 1.5px #FCA5A5)'

  const filterStyle = isSelected
    ? `${borderShadow} drop-shadow(0 0 6px rgba(251,191,36,0.95))`
    : borderShadow

  // アイドルアニメーション: 選択中は無効
  const { animState, onAnimationComplete } = useIdleAnimation(
    piece.type,
    !isSelected,
    idleStaggerDelay,
  )

  const idleConfig = IDLE_ANIMATION_CONFIG[piece.type]

  // 選択中の場合: 既存のバウンスアニメーション
  if (isSelected) {
    return (
      <motion.div
        className={`flex h-full w-full flex-col items-center justify-center ${bgClass}`}
        style={{
          clipPath: PIECE_CLIP_PATH,
          rotate: isOpponent ? 180 : 0,
          filter: filterStyle,
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full flex-1 min-h-0 p-0.5">
          <AnimalComponent {...colors} isPromoted={promoted} />
        </div>
        <span className={`text-[8px] font-bold leading-none pb-0.5 ${isSente ? 'text-blue-900' : 'text-red-900'}`}>
          {hiragana}
        </span>
      </motion.div>
    )
  }

  // 通常状態: アイドルアニメーション
  const currentVariant = idleConfig ? animState : 'idle'

  return (
    <motion.div
      className={`flex h-full w-full flex-col items-center justify-center ${bgClass}`}
      style={{
        clipPath: PIECE_CLIP_PATH,
        rotate: isOpponent ? 180 : 0,
        filter: filterStyle,
      }}
      variants={idleConfig?.variants}
      animate={currentVariant}
      onAnimationComplete={animState === 'animating' ? onAnimationComplete : undefined}
    >
      <div className="w-full flex-1 min-h-0 p-0.5">
        <AnimalComponent {...colors} isPromoted={promoted} />
      </div>
      <span className={`text-[8px] font-bold leading-none pb-0.5 ${isSente ? 'text-blue-900' : 'text-red-900'}`}>
        {hiragana}
      </span>
    </motion.div>
  )
}
