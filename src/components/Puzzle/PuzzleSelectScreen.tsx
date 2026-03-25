'use client'

import { motion } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { SeasonalBackground } from '@/components/Background'
import { PUZZLES_1TE, PUZZLES_3TE } from '@/lib/puzzle/puzzleData'

interface PuzzleSelectScreenProps {
  solvedPuzzleIds: string[]
  onSelectPuzzle: (puzzleId: string) => void
  onBack: () => void
}

function DifficultySection({
  title,
  puzzles,
  solvedPuzzleIds,
  onSelect,
}: {
  title: string
  puzzles: Array<{ id: string }>
  solvedPuzzleIds: string[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="w-full">
      <h2 className="mb-2 text-lg font-bold text-amber-800">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {puzzles.map((puzzle, i) => {
          const isSolved = solvedPuzzleIds.includes(puzzle.id)
          return (
            <motion.button
              key={puzzle.id}
              className={[
                'flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold shadow-sm transition-colors',
                isSolved
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                  : 'bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50',
              ].join(' ')}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(puzzle.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 20 }}
            >
              {isSolved ? '✅' : i + 1}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export function PuzzleSelectScreen({ solvedPuzzleIds, onSelectPuzzle, onBack }: PuzzleSelectScreenProps) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center gap-6 overflow-y-auto p-6 sm:p-8"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
      }}
    >
      <SeasonalBackground />
      {/* タイトル */}
      <motion.h1
        className="text-2xl font-black text-amber-700 drop-shadow-sm sm:text-3xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        つめしょうぎ パズル
      </motion.h1>

      {/* 1手詰めセクション */}
      <DifficultySection
        title="1てづめ"
        puzzles={PUZZLES_1TE}
        solvedPuzzleIds={solvedPuzzleIds}
        onSelect={onSelectPuzzle}
      />

      {/* 3手詰めセクション */}
      <DifficultySection
        title="3てづめ"
        puzzles={PUZZLES_3TE}
        solvedPuzzleIds={solvedPuzzleIds}
        onSelect={onSelectPuzzle}
      />

      {/* もどるボタン */}
      <motion.div
        className="w-full max-w-xs pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatedButton
          className="w-full rounded-2xl border-2 border-amber-300 bg-white py-3 text-base font-semibold text-amber-700 shadow"
          onClick={onBack}
        >
          もどる
        </AnimatedButton>
      </motion.div>
    </main>
  )
}
