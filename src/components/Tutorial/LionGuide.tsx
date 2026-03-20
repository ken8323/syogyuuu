'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface LionGuideProps {
  message: string
}

export function LionGuide({ message }: LionGuideProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center gap-3 px-4">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image src="/icons/lion.png" alt="ライオン" fill style={{ objectFit: 'contain' }} />
        </div>
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg px-4 py-3 text-lg font-bold text-gray-800 max-w-xs"
        >
          {message}
        </motion.div>
      </div>
    </div>
  )
}
