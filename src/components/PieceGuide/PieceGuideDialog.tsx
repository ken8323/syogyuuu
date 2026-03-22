'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { PIECE_CONFIG } from '@/components/Piece'
import { MoveDiagram } from './MoveDiagram'
import { PIECE_GUIDE_DATA } from './pieceGuideData'

interface PieceGuideDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function PieceGuideDialog({ isOpen, onClose }: PieceGuideDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ダイアログ */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div
              className="flex max-h-[95vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* タイトル */}
              <h2 className="shrink-0 pt-4 pb-2 text-center text-xl font-bold text-gray-800">
                こまの うごきかた
              </h2>

              {/* カードグリッド（スクロール可能） */}
              <div className="flex-1 overflow-y-auto px-4 pb-2">
                <div className="grid grid-cols-4 gap-2">
                  {PIECE_GUIDE_DATA.map((entry) => (
                    <PieceCard key={entry.type} entry={entry} />
                  ))}
                </div>
              </div>

              {/* 閉じるボタン */}
              <div className="shrink-0 px-6 pb-4 pt-2">
                <AnimatedButton
                  className="w-full rounded-2xl bg-gray-200 py-3 text-base font-semibold text-gray-600 hover:bg-gray-300"
                  onClick={onClose}
                >
                  とじる
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PieceCard({ entry }: { entry: (typeof PIECE_GUIDE_DATA)[number] }) {
  const config = PIECE_CONFIG[entry.type]

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-amber-50 p-2 shadow-sm">
      {/* 通常駒 */}
      <div className="flex items-center gap-1.5">
        <div className="relative h-8 w-8 shrink-0">
          <Image
            src={config.imageSrc}
            alt={config.hiragana}
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800">{entry.hiragana}</p>
          <p className="text-[10px] leading-tight text-gray-500">{entry.description}</p>
        </div>
      </div>

      {/* 移動図解 */}
      <div className="mx-auto w-[80%]">
        <MoveDiagram
          pieceType={entry.type}
          steps={entry.steps}
          slides={entry.slides}
        />
      </div>

      {/* 成駒セクション */}
      {entry.promoted && (
        <>
          <div className="flex items-center gap-1.5 border-t border-amber-200 pt-1">
            <div className="relative h-7 w-7 shrink-0">
              <Image
                src={PIECE_CONFIG[entry.promoted.type].imageSrc}
                alt={entry.promoted.hiragana}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-700">→ {entry.promoted.hiragana}</p>
              <p className="text-[9px] leading-tight text-gray-500">{entry.promoted.description}</p>
            </div>
          </div>
          <div className="mx-auto w-[80%]">
            <MoveDiagram
              pieceType={entry.promoted.type}
              steps={entry.promoted.steps}
              slides={entry.promoted.slides}
            />
          </div>
        </>
      )}
    </div>
  )
}
