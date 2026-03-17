'use client'

import { AnimatedButton } from '@/components/ui/AnimatedButton'

interface SkipButtonProps {
  onSkip: () => void
}

export function SkipButton({ onSkip }: SkipButtonProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 60,
      }}
    >
      <AnimatedButton
        onClick={onSkip}
        className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full"
      >
        スキップ
      </AnimatedButton>
    </div>
  )
}
