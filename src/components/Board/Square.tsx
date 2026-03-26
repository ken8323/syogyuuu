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
  /** 王手状態の王将がいるマス（赤脈動） */
  isKingInCheck?: boolean
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
  isKingInCheck = false,
  onClick,
}: SquareProps) {
  // 木目テクスチャ: 5層グラデーションで板目の質感を表現
  const woodGrain = [
    // 太い木目筋
    'linear-gradient(105deg, transparent 38%, rgba(139,90,43,0.10) 38%, rgba(139,90,43,0.10) 41%, transparent 41%)',
    // 中間の木目筋
    'linear-gradient(105deg, transparent 58%, rgba(139,90,43,0.07) 58%, rgba(139,90,43,0.07) 60%, transparent 60%)',
    // 細い木目筋
    'linear-gradient(105deg, transparent 72%, rgba(139,90,43,0.04) 72%, rgba(139,90,43,0.04) 73%, transparent 73%)',
    // 年輪風の微細パターン
    'repeating-linear-gradient(102deg, transparent, transparent 3px, rgba(160,120,60,0.03) 3px, rgba(160,120,60,0.03) 4px)',
    // 上部ハイライト（光の当たり具合）
    'linear-gradient(to bottom, rgba(255,220,150,0.25) 0%, transparent 55%)',
  ].join(', ')

  let bgColor = ''
  if (isSelected) bgColor = '#7dd3fc'
  else if (isLastMoveTo) bgColor = '#fde047'
  else if (isLastMoveFrom) bgColor = '#fef08a'

  // 木彫り風溝: box-shadow で右辺・下辺に影+ハイライトを重ねる
  const grooveShadow = [
    // 右辺の溝（影）
    '1px 0 0 rgba(100,60,20,0.4)',
    // 右辺の溝（ハイライト）
    '-1px 0 0 rgba(255,210,130,0.15)',
    // 下辺の溝（影）
    '0 1px 0 rgba(100,60,20,0.4)',
    // 下辺の溝（ハイライト）
    '0 -1px 0 rgba(255,210,130,0.15)',
  ].join(', ')

  const bgStyle = bgColor
    ? { backgroundColor: bgColor, boxShadow: grooveShadow }
    : {
        backgroundImage: `${woodGrain}, linear-gradient(to bottom right, #d4a843, #c49132)`,
        backgroundColor: '#d4a843',
        boxShadow: grooveShadow,
      }

  return (
    <div
      className={[
        'relative flex aspect-square items-center justify-center cursor-pointer select-none',
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

      {/* 王手: 王将マスの赤脈動 */}
      {isKingInCheck && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ backgroundColor: 'rgba(239,68,68,1)' }}
        />
      )}

      {children}
    </div>
  )
}
