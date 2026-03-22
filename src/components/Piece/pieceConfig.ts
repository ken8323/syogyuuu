import type { PieceType, PromotedPieceType } from '@/lib/shogi/types'

export interface PieceConfig {
  /** 駒画像のパス（public/icons/ 配下） */
  imageSrc: string
  /** 駒名のひらがな */
  hiragana: string
}

export const PIECE_CONFIG: Record<PieceType | PromotedPieceType, PieceConfig> = {
  // 通常駒
  king:   { imageSrc: '/icons/lion.webp',      hiragana: 'おう'   },
  rook:   { imageSrc: '/icons/washi.webp',     hiragana: 'ひしゃ' },
  bishop: { imageSrc: '/icons/fukuro.webp',    hiragana: 'かく'   },
  gold:   { imageSrc: '/icons/zou.webp',       hiragana: 'きん'   },
  silver: { imageSrc: '/icons/ookami.webp',    hiragana: 'ぎん'   },
  knight: { imageSrc: '/icons/rabbit.webp',    hiragana: 'けいま' },
  lance:  { imageSrc: '/icons/inoshishi.webp', hiragana: 'きょう' },
  pawn:   { imageSrc: '/icons/hiyoko.webp',    hiragana: 'ふ'     },
  // 成駒
  promoted_rook:   { imageSrc: '/icons/nari_washi.webp',    hiragana: 'りゅうおう' },
  promoted_bishop: { imageSrc: '/icons/nari_fukuro.webp',   hiragana: 'りゅうま'   },
  promoted_silver: { imageSrc: '/icons/nari_ookami.webp',   hiragana: 'なぎん'     },
  promoted_knight: { imageSrc: '/icons/nari_rabbit.webp',   hiragana: 'なけい'     },
  promoted_lance:  { imageSrc: '/icons/nari_inoshishi.webp',hiragana: 'なきょ'     },
  promoted_pawn:   { imageSrc: '/icons/niwatori.webp',      hiragana: 'ときん'     },
}

export function isPromotedType(type: PieceType | PromotedPieceType): boolean {
  return type.startsWith('promoted_')
}
