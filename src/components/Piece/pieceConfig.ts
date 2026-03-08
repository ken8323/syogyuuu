import type { ComponentType } from 'react'
import type { PieceType, PromotedPieceType } from '@/lib/shogi/types'
import type { AnimalColors } from './animals'
import { Lion, Hawk, Owl, Elephant, Wolf, Rabbit, Boar, Chick, Chicken } from './animals'

interface AnimalProps extends AnimalColors {
  isPromoted?: boolean
}

export interface PieceConfig {
  AnimalComponent: ComponentType<AnimalProps>
  /** 駒名のひらがな */
  hiragana: string
}

export const PIECE_CONFIG: Record<PieceType | PromotedPieceType, PieceConfig> = {
  // 通常駒
  king:   { AnimalComponent: Lion,     hiragana: 'おう'   },
  rook:   { AnimalComponent: Hawk,     hiragana: 'ひしゃ' },
  bishop: { AnimalComponent: Owl,      hiragana: 'かく'   },
  gold:   { AnimalComponent: Elephant, hiragana: 'きん'   },
  silver: { AnimalComponent: Wolf,     hiragana: 'ぎん'   },
  knight: { AnimalComponent: Rabbit,   hiragana: 'けいま' },
  lance:  { AnimalComponent: Boar,     hiragana: 'きょう' },
  pawn:   { AnimalComponent: Chick,    hiragana: 'ふ'     },
  // 成駒
  promoted_rook:   { AnimalComponent: Hawk,    hiragana: 'りゅう' },
  promoted_bishop: { AnimalComponent: Owl,     hiragana: 'うま'   },
  promoted_silver: { AnimalComponent: Wolf,    hiragana: 'なぎん' },
  promoted_knight: { AnimalComponent: Rabbit,  hiragana: 'なけい' },
  promoted_lance:  { AnimalComponent: Boar,    hiragana: 'なきょ' },
  promoted_pawn:   { AnimalComponent: Chicken, hiragana: 'ときん' },
}

export function isPromotedType(type: PieceType | PromotedPieceType): boolean {
  return type.startsWith('promoted_')
}
