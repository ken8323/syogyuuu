import type { BoardMove, CapturedPieces, DropMove, GameState, HandicapLevel, Move, PieceType, Player, Position, PromotedPieceType } from './types'
import {
  addCapturedPiece,
  createHandicapBoard,
  createInitialCapturedPieces,
  getPieceAt,
  removePieceAt,
  setPieceAt,
  consumeCapturedPiece,
} from './board'
import { getDemotedType, getPromotedType } from './rules'

// ============================================================
// 初期化
// ============================================================

export function createInitialGameState(handicap: HandicapLevel = 'none'): GameState {
  return {
    board: createHandicapBoard(handicap),
    capturedPieces: createInitialCapturedPieces(),
    currentPlayer: 'sente',
    phase: 'idle',
    selectedPosition: null,
    selectedCaptured: null,
    legalMoves: [],
    moveHistory: { moves: [], currentIndex: -1 },
    isCheck: false,
    winner: null,
    gameOverReason: null,
    handicap,
  }
}

// ============================================================
// ユーティリティ
// ============================================================

// 手番を切り替える
function switchPlayer(player: Player): Player {
  return player === 'sente' ? 'gote' : 'sente'
}

// 現在位置以降の Redo 履歴を削除し、新しい手を追加する
function appendMove(state: GameState, move: Move): GameState['moveHistory'] {
  const { moves, currentIndex } = state.moveHistory
  const nextMoves = moves.slice(0, currentIndex + 1)
  nextMoves.push(move)
  return { moves: nextMoves, currentIndex: currentIndex + 1 }
}

// ============================================================
// 手の実行
// ============================================================

// 盤上の駒を移動する
export function executeMove(
  state: GameState,
  from: Position,
  to: Position,
  promote: boolean,
): GameState {
  const piece = getPieceAt(state.board, from)
  if (!piece) return state

  const captured = getPieceAt(state.board, to)

  // 駒を移動（成りの場合は成駒に変換）
  const movedPieceType = promote
    ? (getPromotedType(piece.type as PieceType) ?? piece.type)
    : piece.type
  const movedPiece = { type: movedPieceType, owner: piece.owner }

  let board = removePieceAt(state.board, from)
  board = setPieceAt(board, to, movedPiece)

  // 取った駒を持ち駒に追加（成駒は元の駒種に戻す）
  let capturedPieces = state.capturedPieces
  if (captured) {
    const demotedType = captured.type.startsWith('promoted_')
      ? getDemotedType(captured.type as PromotedPieceType)
      : (captured.type as PieceType)
    capturedPieces = addCapturedPiece(capturedPieces, state.currentPlayer, demotedType)
  }

  const boardMove: BoardMove = {
    type: 'move',
    from,
    to,
    piece,
    captured,
    promoted: promote,
  }

  return {
    ...state,
    board,
    capturedPieces,
    currentPlayer: switchPlayer(state.currentPlayer),
    moveHistory: appendMove(state, boardMove),
    selectedPosition: null,
    selectedCaptured: null,
    legalMoves: [],
  }
}

// 持ち駒を打つ
export function executeDrop(
  state: GameState,
  pieceType: PieceType,
  to: Position,
): GameState {
  const capturedPieces = consumeCapturedPiece(state.capturedPieces, state.currentPlayer, pieceType)
  const piece = { type: pieceType, owner: state.currentPlayer }
  const board = setPieceAt(state.board, to, piece)

  const dropMove: DropMove = {
    type: 'drop',
    to,
    piece,
  }

  return {
    ...state,
    board,
    capturedPieces,
    currentPlayer: switchPlayer(state.currentPlayer),
    moveHistory: appendMove(state, dropMove),
    selectedPosition: null,
    selectedCaptured: null,
    legalMoves: [],
  }
}

// ============================================================
// Undo / Redo
// ============================================================

// 直前の手を取り消す
export function undoMove(state: GameState): GameState {
  const { moves, currentIndex } = state.moveHistory
  if (currentIndex < 0) return state

  const move = moves[currentIndex]
  let board = state.board
  let capturedPieces: CapturedPieces = state.capturedPieces

  if (move.type === 'move') {
    // 駒を元の位置に戻す（成りを元に戻す）
    board = removePieceAt(board, move.to)
    board = setPieceAt(board, move.from, move.piece)

    // 取られた駒を復元する
    if (move.captured) {
      board = setPieceAt(board, move.to, move.captured)
      // 持ち駒から取り戻した駒を除去
      const demotedType = move.captured.type.startsWith('promoted_')
        ? getDemotedType(move.captured.type as PromotedPieceType)
        : (move.captured.type as PieceType)
      capturedPieces = consumeCapturedPiece(capturedPieces, move.piece.owner, demotedType)
    }
  } else {
    // DropMove: 打った駒を盤面から除去し、持ち駒に戻す
    board = removePieceAt(board, move.to)
    capturedPieces = addCapturedPiece(capturedPieces, move.piece.owner, move.piece.type as PieceType)
  }

  return {
    ...state,
    board,
    capturedPieces,
    currentPlayer: switchPlayer(state.currentPlayer),
    moveHistory: { moves, currentIndex: currentIndex - 1 },
    selectedPosition: null,
    selectedCaptured: null,
    legalMoves: [],
  }
}

// 取り消した手を再実行する
export function redoMove(state: GameState): GameState {
  const { moves, currentIndex } = state.moveHistory
  if (currentIndex >= moves.length - 1) return state

  const move = moves[currentIndex + 1]
  let board = state.board
  let capturedPieces: CapturedPieces = state.capturedPieces

  if (move.type === 'move') {
    // 成りの場合は成駒に変換
    const movedPieceType = move.promoted
      ? (getPromotedType(move.piece.type as PieceType) ?? move.piece.type)
      : move.piece.type
    const movedPiece = { type: movedPieceType, owner: move.piece.owner }

    board = removePieceAt(board, move.from)
    board = setPieceAt(board, move.to, movedPiece)

    // 履歴に保存済みの取られた駒を使う（再取得より信頼性が高い）
    if (move.captured) {
      const demotedType = move.captured.type.startsWith('promoted_')
        ? getDemotedType(move.captured.type as PromotedPieceType)
        : (move.captured.type as PieceType)
      capturedPieces = addCapturedPiece(capturedPieces, move.piece.owner, demotedType)
    }
  } else {
    capturedPieces = consumeCapturedPiece(capturedPieces, move.piece.owner, move.piece.type as PieceType)
    board = setPieceAt(board, move.to, move.piece)
  }

  return {
    ...state,
    board,
    capturedPieces,
    currentPlayer: switchPlayer(state.currentPlayer),
    moveHistory: { moves, currentIndex: currentIndex + 1 },
    selectedPosition: null,
    selectedCaptured: null,
    legalMoves: [],
  }
}
