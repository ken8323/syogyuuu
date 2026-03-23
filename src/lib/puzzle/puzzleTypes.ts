import type { Board, PieceType, Position } from '@/lib/shogi/types'

export type PuzzleDifficulty = '1te' | '3te'

export interface PuzzleSolutionStep {
  from: Position | null       // 移動元（null = 持ち駒打ち）
  to: Position                // 移動先
  pieceType?: PieceType       // 打つ駒の種類（持ち駒打ちの場合）
  promote?: boolean           // 成るかどうか
}

export interface PuzzleDefinition {
  id: string                  // パズルID（例: '1te-01'）
  difficulty: PuzzleDifficulty
  title: string               // 問題名（例: '1てづめ もんだい1'）
  board: Board                // 初期盤面（9x9、使わないマスはnull）
  attackerCaptured: Partial<Record<PieceType, number>>  // 攻め方（先手）の持ち駒
  solution: PuzzleSolutionStep[]  // 正解手順
}
