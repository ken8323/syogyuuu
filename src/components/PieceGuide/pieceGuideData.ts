import type { PieceType, PromotedPieceType } from '@/lib/shogi/types'

/**
 * 5×5 ミニ盤面上の移動パターン定義
 * 中央 [2,2] に駒を配置し、相対位置で移動可能マスを表現する
 */

/** ステップ（1マス移動）の相対位置 */
type Step = { dRow: number; dCol: number }

/** スライド（複数マス移動）の方向 */
type Slide = { dRow: number; dCol: number }

export interface PieceGuideEntry {
  type: PieceType
  hiragana: string
  description: string
  steps: Step[]
  slides: Slide[]
  promoted?: {
    type: PromotedPieceType
    hiragana: string
    description: string
    steps: Step[]
    slides: Slide[]
  }
}

// 方向定数（先手基準: 前=上=dRow負）
const F  = { dRow: -1, dCol:  0 }  // 前
const B  = { dRow:  1, dCol:  0 }  // 後
const L  = { dRow:  0, dCol: -1 }  // 左
const R  = { dRow:  0, dCol:  1 }  // 右
const FL = { dRow: -1, dCol: -1 }  // 左前
const FR = { dRow: -1, dCol:  1 }  // 右前
const BL = { dRow:  1, dCol: -1 }  // 左後
const BR = { dRow:  1, dCol:  1 }  // 右後

const GOLD_STEPS: Step[] = [F, FL, FR, L, R, B]

export const PIECE_GUIDE_DATA: PieceGuideEntry[] = [
  {
    type: 'king',
    hiragana: 'おう',
    description: 'まわり ぜんぶ いけるよ！',
    steps: [F, B, L, R, FL, FR, BL, BR],
    slides: [],
  },
  {
    type: 'rook',
    hiragana: 'ひしゃ',
    description: 'まっすぐ どこまでも いけるよ！',
    steps: [],
    slides: [F, B, L, R],
    promoted: {
      type: 'promoted_rook',
      hiragana: 'りゅうおう',
      description: 'まっすぐ＋ななめ1マスも いけるよ！',
      steps: [FL, FR, BL, BR],
      slides: [F, B, L, R],
    },
  },
  {
    type: 'bishop',
    hiragana: 'かく',
    description: 'ななめに どこまでも いけるよ！',
    steps: [],
    slides: [FL, FR, BL, BR],
    promoted: {
      type: 'promoted_bishop',
      hiragana: 'りゅうま',
      description: 'ななめ＋まっすぐ1マスも いけるよ！',
      steps: [F, B, L, R],
      slides: [FL, FR, BL, BR],
    },
  },
  {
    type: 'gold',
    hiragana: 'きん',
    description: 'まえと よこに つよいよ！',
    steps: GOLD_STEPS,
    slides: [],
  },
  {
    type: 'silver',
    hiragana: 'ぎん',
    description: 'まえと ななめに いけるよ！',
    steps: [F, FL, FR, BL, BR],
    slides: [],
    promoted: {
      type: 'promoted_silver',
      hiragana: 'なぎん',
      description: 'きんと おなじ うごきだよ！',
      steps: GOLD_STEPS,
      slides: [],
    },
  },
  {
    type: 'knight',
    hiragana: 'けいま',
    description: 'ぴょんと とべるよ！',
    steps: [{ dRow: -2, dCol: -1 }, { dRow: -2, dCol: 1 }],
    slides: [],
    promoted: {
      type: 'promoted_knight',
      hiragana: 'なけい',
      description: 'きんと おなじ うごきだよ！',
      steps: GOLD_STEPS,
      slides: [],
    },
  },
  {
    type: 'lance',
    hiragana: 'きょう',
    description: 'まえに まっすぐ すすむよ！',
    steps: [],
    slides: [F],
    promoted: {
      type: 'promoted_lance',
      hiragana: 'なきょ',
      description: 'きんと おなじ うごきだよ！',
      steps: GOLD_STEPS,
      slides: [],
    },
  },
  {
    type: 'pawn',
    hiragana: 'ふ',
    description: 'いっぽずつ まえに すすむよ！',
    steps: [F],
    slides: [],
    promoted: {
      type: 'promoted_pawn',
      hiragana: 'ときん',
      description: 'きんと おなじ うごきだよ！',
      steps: GOLD_STEPS,
      slides: [],
    },
  },
]
