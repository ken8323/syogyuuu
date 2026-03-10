'use client'

interface SquareProps {
  /** Piece component を差し込むスロット（#10 で Piece コンポーネントに置き換え） */
  children?: React.ReactNode
  isSelected: boolean
  isLegalMove: boolean
  /** legalMove かつ敵駒がいるマス（赤ハイライト） */
  isCapturable: boolean
  isLastMoveFrom: boolean
  isLastMoveTo: boolean
  onClick: () => void
}

export function Square({
  children,
  isSelected,
  isLegalMove,
  isCapturable,
  isLastMoveFrom,
  isLastMoveTo,
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
      className="relative flex aspect-square items-center justify-center border-r border-b border-amber-900/60 cursor-pointer select-none"
      style={bgStyle}
      onClick={onClick}
    >
      {/* 取れる駒ハイライト（赤） */}
      {isCapturable && (
        <div className="pointer-events-none absolute inset-0 rounded-sm bg-red-400/40" />
      )}

      {/* 合法手ドット（緑） */}
      {isLegalMove && !isCapturable && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[45%] w-[45%] rounded-full bg-green-600/40" />
        </div>
      )}

      {children}
    </div>
  )
}
