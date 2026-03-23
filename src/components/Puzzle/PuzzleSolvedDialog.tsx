'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

interface PuzzleSolvedDialogProps {
  isOpen: boolean
  hasNextPuzzle: boolean
  onNext: () => void
  onBack: () => void
}

export function PuzzleSolvedDialog({ isOpen, hasNextPuzzle, onNext, onBack }: PuzzleSolvedDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mx-4 flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-2xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* チェックマーク */}
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
            >
              ✅
            </motion.div>

            {/* メッセージ */}
            <motion.p
              className="text-2xl font-black text-amber-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              すごい！
            </motion.p>

            {/* ボタン */}
            <div className="flex w-full flex-col gap-3 pt-2">
              {hasNextPuzzle && (
                <AnimatedButton
                  className="w-full rounded-2xl bg-amber-500 py-3 text-base font-bold text-white shadow-lg"
                  onClick={onNext}
                >
                  つぎのもんだい
                </AnimatedButton>
              )}
              <AnimatedButton
                className="w-full rounded-2xl border-2 border-amber-300 bg-white py-3 text-base font-semibold text-amber-700 shadow"
                onClick={onBack}
              >
                もどる
              </AnimatedButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
