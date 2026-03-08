'use client'

import type { Player } from '@/lib/shogi/types'

interface ControlBarProps {
  currentPlayer: Player
  canUndo: boolean
  canRedo: boolean
  isMuted: boolean
  onUndo: () => void
  onRedo: () => void
  onMenu: () => void
  onToggleMute: () => void
}

export function ControlBar({
  currentPlayer,
  canUndo,
  canRedo,
  isMuted,
  onUndo,
  onRedo,
  onMenu,
  onToggleMute,
}: ControlBarProps) {
  const isSente = currentPlayer === 'sente'

  return (
    <div className="flex h-full w-full items-center justify-between gap-2 px-2">
      {/* もどるボタン */}
      <button
        className={[
          'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-bold transition-colors',
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
          'flex flex-1 items-center justify-center rounded-lg px-2 py-1 text-sm font-bold',
          isSente
            ? 'bg-blue-100 text-blue-900'
            : 'bg-red-100 text-red-900',
        ].join(' ')}
      >
        あなたのばんだよ！
      </div>

      {/* すすむボタン */}
      <button
        className={[
          'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-bold transition-colors',
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

      {/* ミュートボタン */}
      <button
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-stone-200 px-3 text-sm font-bold text-stone-700 hover:bg-stone-300"
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
    </div>
  )
}
