import type { PieceType, PromotedPieceType } from '@/lib/shogi/types'

export interface PieceConfig {
  /** 動物絵文字（SVG実装までのプレースホルダ） */
  emoji: string
  /** 駒名のひらがな */
  hiragana: string
}

export const PIECE_CONFIG: Record<PieceType | PromotedPieceType, PieceConfig> = {
  // 通常駒
  king:   { emoji: '🦁', hiragana: 'おう'   },
  rook:   { emoji: '🦅', hiragana: 'ひしゃ' },
  bishop: { emoji: '🦉', hiragana: 'かく'   },
  gold:   { emoji: '🐘', hiragana: 'きん'   },
  silver: { emoji: '🐺', hiragana: 'ぎん'   },
  knight: { emoji: '🐰', hiragana: 'けいま' },
  lance:  { emoji: '🐗', hiragana: 'きょう' },
  pawn:   { emoji: '🐤', hiragana: 'ふ'     },
  // 成駒（promoted_ prefix）
  promoted_rook:   { emoji: '🦅', hiragana: 'りゅう' },
  promoted_bishop: { emoji: '🦉', hiragana: 'うま'   },
  promoted_silver: { emoji: '🐺', hiragana: 'なぎん' },
  promoted_knight: { emoji: '🐰', hiragana: 'なけい' },
  promoted_lance:  { emoji: '🐗', hiragana: 'なきょ' },
  promoted_pawn:   { emoji: '🐔', hiragana: 'ときん' },
}

export function isPromotedType(type: PieceType | PromotedPieceType): boolean {
  return type.startsWith('promoted_')
}
