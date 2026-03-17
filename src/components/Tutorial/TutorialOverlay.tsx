'use client'

import { useLayoutEffect, useState } from 'react'

interface HighlightSquare {
  row: number
  col: number
}

interface TutorialOverlayProps {
  highlightSquares: HighlightSquare[]
  boardRef: React.RefObject<HTMLDivElement>
  squareSize: number
}

interface SquareRect {
  x: number
  y: number
  width: number
  height: number
}

export function TutorialOverlay({
  highlightSquares,
  boardRef,
  squareSize,
}: TutorialOverlayProps) {
  const [squareRects, setSquareRects] = useState<SquareRect[]>([])

  useLayoutEffect(() => {
    const recalculate = () => {
      if (!boardRef.current) return
      const boardRect = boardRef.current.getBoundingClientRect()
      const rects = highlightSquares.map((sq) => ({
        x: boardRect.left + sq.col * squareSize,
        y: boardRect.top + sq.row * squareSize,
        width: squareSize,
        height: squareSize,
      }))
      setSquareRects(rects)
    }

    recalculate()
    window.addEventListener('resize', recalculate)
    return () => window.removeEventListener('resize', recalculate)
  }, [highlightSquares, boardRef, squareSize])

  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <mask id="tutorial-holes">
          <rect width="100%" height="100%" fill="white" />
          {squareRects.map((rect, i) => (
            <rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill="black"
            />
          ))}
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.6)"
        mask="url(#tutorial-holes)"
      />
    </svg>
  )
}
