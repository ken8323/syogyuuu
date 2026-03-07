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
  let bgClass = 'bg-amber-200'
  if (isSelected) bgClass = 'bg-sky-300'
  else if (isLastMoveTo) bgClass = 'bg-yellow-300'
  else if (isLastMoveFrom) bgClass = 'bg-yellow-200'

  return (
    <div
      className={`relative flex aspect-square items-center justify-center border-r border-b border-amber-900/50 cursor-pointer select-none ${bgClass}`}
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
