'use client'

import { AnimatedButton } from '@/components/ui/AnimatedButton'

interface PuzzleControlBarProps {
  onReset: () => void
  onHint: () => void
  onBack: () => void
}

export function PuzzleControlBar({ onReset, onHint, onBack }: PuzzleControlBarProps) {
  return (
    <div className="flex w-full items-center justify-center gap-3 px-2 py-1">
      <AnimatedButton
        className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700 ring-1 ring-amber-300 shadow-sm"
        onClick={onReset}
      >
        やりなおす
      </AnimatedButton>
      <AnimatedButton
        className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-300 shadow-sm"
        onClick={onHint}
      >
        ヒント
      </AnimatedButton>
      <AnimatedButton
        className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 ring-1 ring-gray-300 shadow-sm"
        onClick={onBack}
      >
        もどる
      </AnimatedButton>
    </div>
  )
}
