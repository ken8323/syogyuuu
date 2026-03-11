'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SquareProps {
  /** Piece component を差し込むスロット（#10 で Piece コンポーネントに置き換え） */
  children?: React.ReactNode
  isSelected: boolean
  isLegalMove: boolean
  /** legalMove かつ敵駒がいるマス（赤ハイライト） */
  isCapturable: boolean
  isLastMoveFrom: boolean
  isLastMoveTo: boolean
  /** ヒント: この駒を動かせる（脈動アニメーション） */
  isHintPiece: boolean
  /** ヒント: おすすめの移動先（琥珀色ドット） */
  isHintMove: boolean
  /** 合法手ドットのポップイン遅延（ms）: 駒からのチェビシェフ距離 × 40ms */
  legalMoveInDelay: number
  /** 合法手ドットのポップアウト遅延（ms）: 逆順フェードアウト用 */
  legalMoveOutDelay: number
  onClick: () => void
}

export function Square({
  children,
  isSelected,
  isLegalMove,
  isCapturable,
  isLastMoveFrom,
  isLastMoveTo,
  isHintPiece,
  isHintMove,
  legalMoveInDelay,
  legalMoveOutDelay,
  onClick,
}: SquareProps) {
  // 木目テクスチャ: 斜めグラデーションで板目を表現
  const woodGrain = [
    'linear-gradient(105deg, transparent 40%, rgba(139,90,43,0.07) 40%, rgba(139,90,43,0.07) 42%, transparent 42%)',
    'linear-gradient(105deg, transparent 60%, rgba(139,90,43,0.05) 60%, rgba(139,90,43,0.05) 61%, transparent 61%)',
    'linear-gradient(to bottom, rgba(255,220,150,0.3) 0%, transparent 60%)',
  ].join(', ')

  let bgColor = ''
  if (isSelected) bgColor = '#7dd3fc'
  else if (isLastMoveTo) bgColor = '#fde047'
  else if (isLastMoveFrom) bgColor = '#fef08a'

  const insetShadow = 'inset 1px 1px 3px rgba(0,0,0,0.15), inset -1px -1px 2px rgba(255,200,80,0.2)'
  const bgStyle = bgColor
    ? { backgroundColor: bgColor, boxShadow: insetShadow }
    : {
        backgroundImage: `${woodGrain}, linear-gradient(to bottom right, #d4a843, #c49132)`,
        backgroundColor: '#d4a843',
        boxShadow: insetShadow,
      }

  return (
    <div
      className={[
        'relative flex aspect-square items-center justify-center border-r border-b border-amber-900/60 cursor-pointer select-none',
        isSelected ? 'z-10' : '',
      ].join(' ')}
      style={bgStyle}
      onClick={onClick}
    >
      {/* 取れる駒ハイライト（赤・ポップイン + パルス） */}
      <AnimatePresence>
        {isCapturable && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-sm bg-red-400/40"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.1, delay: legalMoveOutDelay / 1000 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: legalMoveInDelay / 1000 }}
          >
            <motion.div
              className="absolute inset-0 rounded-sm bg-red-400/30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 合法手ドット（緑・ポップイン） */}
      <AnimatePresence>
        {isLegalMove && !isCapturable && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1, delay: legalMoveOutDelay / 1000 } }}
            transition={{ delay: legalMoveInDelay / 1000 }}
          >
            <motion.div
              className="h-[45%] w-[45%] rounded-full bg-green-600/40"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, transition: { duration: 0.1, delay: legalMoveOutDelay / 1000 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: legalMoveInDelay / 1000 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヒント: おすすめ移動先ドット（琥珀色・脈動） */}
      {isHintMove && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-[45%] w-[45%] rounded-full bg-amber-400/70"
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* ヒント: 動かせる駒のグロー（黄色・脈動） */}
      {isHintPiece && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(circle, rgba(251,191,36,0.7) 30%, transparent 70%)',
          }}
        />
      )}

      {/* 着地フラッシュ（isLastMoveTo マウント時に opacity 0.4→0） */}
      {isLastMoveTo && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-sm bg-white"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}

      {children}
    </div>
  )
}
