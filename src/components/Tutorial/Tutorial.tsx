'use client'

import { useEffect, useRef, useState } from 'react'
import { TutorialBoard } from './TutorialBoard'
import { TutorialOverlay } from './TutorialOverlay'
import { AnimatedHand } from './AnimatedHand'
import { LionGuide } from './LionGuide'
import { SuccessEffect } from './SuccessEffect'
import { SkipButton } from './SkipButton'

// TutorialStep may also be defined in src/lib/shogi/types.ts by another agent.
// Define locally as a fallback.
type TutorialStep = 'select_piece' | 'move_piece' | 'capture_piece' | 'complete'

interface TutorialProps {
  onComplete: () => void
}

type TutorialPiece = {
  type: 'lion' | 'chick'
  owner: 'sente' | 'gote'
  row: number
  col: number
}

const STEP1_2_PIECES: TutorialPiece[] = [
  { type: 'lion', owner: 'sente', row: 8, col: 4 },
  { type: 'chick', owner: 'sente', row: 6, col: 4 },
]

const STEP3_PIECES: TutorialPiece[] = [
  { type: 'lion', owner: 'sente', row: 8, col: 4 },
  { type: 'chick', owner: 'sente', row: 5, col: 4 },
  { type: 'chick', owner: 'gote', row: 4, col: 4 },
]

const STEP_CONFIG: Record<
  TutorialStep,
  {
    message: string
    handTarget: { row: number; col: number } | null
    highlightSquares: Array<{ row: number; col: number; color: 'green' | 'red' }>
    pieces: TutorialPiece[]
  }
> = {
  select_piece: {
    message: 'この子をタップしてね！',
    handTarget: { row: 6, col: 4 },
    highlightSquares: [{ row: 6, col: 4, color: 'green' }],
    pieces: STEP1_2_PIECES,
  },
  move_piece: {
    message: 'みどりのところをタップ！',
    handTarget: { row: 5, col: 4 },
    highlightSquares: [{ row: 5, col: 4, color: 'green' }],
    pieces: STEP1_2_PIECES,
  },
  capture_piece: {
    message: 'あかいところで あいてのコマをとれるよ！',
    handTarget: { row: 4, col: 4 },
    highlightSquares: [{ row: 4, col: 4, color: 'red' }],
    pieces: STEP3_PIECES,
  },
  complete: {
    message: 'じょうずにできたね！ しょうぎをはじめよう！',
    handTarget: null,
    highlightSquares: [],
    pieces: STEP3_PIECES,
  },
}

const SQUARE_SIZE = 44

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState<TutorialStep>('select_piece')
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)

  const config = STEP_CONFIG[step]

  useEffect(() => {
    if (step === 'complete') {
      const timer = setTimeout(() => {
        onComplete()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [step, onComplete])

  const handleSquareTap = (row: number, col: number) => {
    if (step === 'select_piece') {
      if (row === 6 && col === 4) {
        setSelectedPos({ row, col })
        setStep('move_piece')
      }
    } else if (step === 'move_piece') {
      if (row === 5 && col === 4) {
        setSelectedPos(null)
        setShowSuccess(true)
      }
    } else if (step === 'capture_piece') {
      if (row === 4 && col === 4) {
        setShowSuccess(true)
      }
    }
  }

  const handleSuccessComplete = () => {
    setShowSuccess(false)
    if (step === 'move_piece') setStep('capture_piece')
    else if (step === 'capture_piece') setStep('complete')
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden p-4"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
      }}
    >
      <SkipButton onSkip={onComplete} />
      <TutorialBoard
        pieces={config.pieces}
        selectedPos={selectedPos}
        highlightSquares={config.highlightSquares}
        onSquareTap={handleSquareTap}
        boardRef={boardRef}
      />
      <TutorialOverlay
        highlightSquares={config.highlightSquares}
        boardRef={boardRef}
        squareSize={SQUARE_SIZE}
      />
      {config.handTarget && (
        <AnimatedHand
          targetRow={config.handTarget.row}
          targetCol={config.handTarget.col}
          boardRef={boardRef}
          squareSize={SQUARE_SIZE}
        />
      )}
      <LionGuide message={config.message} />
      <SuccessEffect show={showSuccess} onComplete={handleSuccessComplete} />
    </main>
  )
}
