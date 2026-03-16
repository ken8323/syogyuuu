'use client'

import { motion } from 'framer-motion'
import type { Player } from '@/lib/shogi/types'

interface ControlBarProps {
  currentPlayer: Player
  canUndo: boolean
  canRedo: boolean
  isMuted: boolean
  canShowHint: boolean
  onUndo: () => void
  onRedo: () => void
  onMenu: () => void
  onToggleMute: () => void
  onShowHint: () => void
}

export function ControlBar({
  currentPlayer,
  canUndo,
  canRedo,
  isMuted,
  canShowHint,
  onUndo,
  onRedo,
  onMenu,
  onToggleMute,
  onShowHint,
}: ControlBarProps) {
  const isSente = currentPlayer === 'sente'

  return (
    <motion.div
      className="flex h-full w-full items-center justify-between gap-2 border-l-4 px-2"
      animate={{ borderColor: isSente ? '#3B82F6' : '#EF4444' }}
      transition={{ duration: 0.3 }}
    >
      {/* もどるボタン */}
      <button
        className={[
          'flex min-h-[44px] min-w-[44px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-bold transition-colors',
          canUndo
            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            : 'cursor-not-allowed bg-stone-100 text-stone-400',
        ].join(' ')}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="もどる"
      >
        ◀ もどる
      </button>

      {/* 手番表示 */}
      <div
        className={[
          'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-1 text-sm font-bold',
          isSente
            ? 'bg-blue-100 text-blue-900'
            : 'bg-red-100 text-red-900',
        ].join(' ')}
      >
        <motion.span
          className={[
            'inline-block h-3 w-3 rounded-full',
            isSente ? 'bg-blue-500' : 'bg-red-500',
          ].join(' ')}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="truncate">{isSente ? 'あおチームのばん' : 'あかチームのばん'}</span>
      </div>

      {/* すすむボタン */}
      <button
        className={[
          'flex min-h-[44px] min-w-[44px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-bold transition-colors',
          canRedo
            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            : 'cursor-not-allowed bg-stone-100 text-stone-400',
        ].join(' ')}
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="すすむ"
      >
        すすむ ▶
      </button>

      {/* おしえてボタン */}
      <button
        className={[
          'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-bold transition-colors',
          canShowHint
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            : 'cursor-not-allowed bg-stone-100 text-stone-400',
        ].join(' ')}
        onClick={canShowHint ? onShowHint : undefined}
        disabled={!canShowHint}
        aria-label="おしえて"
      >
        💡
      </button>

      {/* ミュートボタン */}
      <button
        className={[
          'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-bold transition-colors',
          isMuted
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-stone-200 text-stone-700 hover:bg-stone-300',
        ].join(' ')}
        onClick={onToggleMute}
        aria-label={isMuted ? 'ミュート解除' : 'ミュート'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* メニューボタン */}
      <button
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-stone-200 px-3 text-sm font-bold text-stone-700 hover:bg-stone-300"
        onClick={onMenu}
        aria-label="メニュー"
      >
        ☰
      </button>
    </motion.div>
  )
}
