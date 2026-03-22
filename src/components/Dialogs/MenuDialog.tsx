'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

interface MenuDialogProps {
  isOpen: boolean
  onClose: () => void
  onResign: () => void
  onReset: () => void
  onOpenGuide: () => void
}

type ConfirmAction = 'resign' | 'reset' | null

const CONFIRM_CONFIG: Record<'resign' | 'reset', { message: string; buttonLabel: string }> = {
  resign: { message: 'ほんとうに まいっちゃう？', buttonLabel: 'まいった！' },
  reset:  { message: 'ほんとうに さいしょから やりなおす？', buttonLabel: 'やりなおす！' },
}

export function MenuDialog({ isOpen, onClose, onResign, onReset, onOpenGuide }: MenuDialogProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const handleClose = () => {
    setConfirmAction(null)
    onClose()
  }

  const handleConfirm = () => {
    if (confirmAction === 'resign') onResign()
    if (confirmAction === 'reset') onReset()
    setConfirmAction(null)
  }

  const confirmConfig = confirmAction ? CONFIRM_CONFIG[confirmAction] : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ（タップで閉じる） */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* メニューダイアログ */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-6 shadow-2xl">
              <h2 className="mb-4 text-center text-xl font-bold text-gray-800">メニュー</h2>

              <AnimatePresence mode="wait">
                {confirmConfig ? (
                  /* 確認ダイアログ */
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-3"
                  >
                    <p className="py-2 text-center text-base font-semibold text-gray-700">
                      {confirmConfig.message}
                    </p>
                    <AnimatedButton
                      className="rounded-2xl bg-red-500 py-3 text-base font-bold text-white hover:bg-red-600"
                      onClick={handleConfirm}
                    >
                      うん、{confirmConfig.buttonLabel}
                    </AnimatedButton>
                    <AnimatedButton
                      className="rounded-2xl bg-gray-200 py-3 text-base font-semibold text-gray-600 hover:bg-gray-300"
                      onClick={() => setConfirmAction(null)}
                    >
                      やめる
                    </AnimatedButton>
                  </motion.div>
                ) : (
                  /* メインメニュー */
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-3"
                  >
                    <AnimatedButton
                      className="rounded-2xl bg-red-100 py-3 text-base font-semibold text-red-700 hover:bg-red-200"
                      onClick={() => setConfirmAction('resign')}
                    >
                      まいった（とうりょう）
                    </AnimatedButton>
                    <AnimatedButton
                      className="rounded-2xl bg-amber-100 py-3 text-base font-semibold text-amber-700 hover:bg-amber-200"
                      onClick={() => setConfirmAction('reset')}
                    >
                      さいしょから やりなおす
                    </AnimatedButton>
                    <AnimatedButton
                      className="rounded-2xl bg-sky-100 py-3 text-base font-semibold text-sky-700 hover:bg-sky-200"
                      onClick={onOpenGuide}
                    >
                      こまの うごきかた
                    </AnimatedButton>
                    <AnimatedButton
                      className="rounded-2xl bg-gray-200 py-3 text-base font-semibold text-gray-600 hover:bg-gray-300"
                      onClick={handleClose}
                    >
                      とじる
                    </AnimatedButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
