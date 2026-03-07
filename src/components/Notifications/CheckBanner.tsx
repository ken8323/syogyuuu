'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CheckBannerProps {
  isVisible: boolean
  onDismiss: () => void
}

export function CheckBanner({ isVisible, onDismiss }: CheckBannerProps) {
  // 1.5秒後に自動で閉じる
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(onDismiss, 1500)
    return () => clearTimeout(timer)
  }, [isVisible, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl bg-red-500 px-6 py-3 text-base font-bold text-white shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          🦁💦 ライオンがあぶないよ！
        </motion.div>
      )}
    </AnimatePresence>
  )
}
