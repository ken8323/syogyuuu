'use client'

import Image from 'next/image'

const PIECE_IMAGES: Record<'lion' | 'chick', string> = {
  lion: '/icons/lion.png',
  chick: '/icons/hiyoko.png',
}

interface TutorialPiece {
  type: 'lion' | 'chick'
  owner: 'sente' | 'gote'
  row: number
  col: number
}

interface TutorialBoardProps {
  pieces: TutorialPiece[]
  selectedPos: { row: number; col: number } | null
  highlightSquares: Array<{ row: number; col: number; color: 'green' | 'red' }>
  onSquareTap: (row: number, col: number) => void
  boardRef: React.RefObject<HTMLDivElement | null>
}

export function TutorialBoard({
  pieces,
  selectedPos,
  highlightSquares,
  onSquareTap,
  boardRef,
}: TutorialBoardProps) {
  const getPieceAt = (row: number, col: number) =>
    pieces.find((p) => p.row === row && p.col === col)

  const getHighlight = (row: number, col: number) =>
    highlightSquares.find((h) => h.row === row && h.col === col)

  const isSelected = (row: number, col: number) =>
    selectedPos !== null && selectedPos.row === row && selectedPos.col === col

  return (
    <div
      ref={boardRef}
      className="grid grid-cols-9 border-2 border-amber-600"
      style={{ width: 9 * 44, height: 9 * 44 }}
    >
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => {
          const piece = getPieceAt(row, col)
          const highlight = getHighlight(row, col)
          const selected = isSelected(row, col)

          let bgClass = 'bg-amber-100'
          if (highlight?.color === 'green') bgClass = 'bg-green-400/50'
          else if (highlight?.color === 'red') bgClass = 'bg-red-400/50'

          return (
            <div
              key={`${row}-${col}`}
              className={`${bgClass} border border-amber-300 flex items-center justify-center cursor-pointer ${selected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              style={{ width: 44, height: 44 }}
              onClick={() => onSquareTap(row, col)}
            >
              {piece && (
                <div
                  className="relative w-9 h-9"
                  style={
                    piece.owner === 'gote'
                      ? { transform: 'rotate(180deg)' }
                      : undefined
                  }
                >
                  <Image
                    src={PIECE_IMAGES[piece.type]}
                    alt={piece.type}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          )
        }),
      )}
    </div>
  )
}
