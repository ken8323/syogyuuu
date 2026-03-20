import type { PieceType, PromotedPieceType } from '@/lib/shogi/types'

export interface PieceConfig {
  /** 駒画像のパス（public/icons/ 配下） */
  imageSrc: string
  /** 駒名のひらがな */
  hiragana: string
}

export const PIECE_CONFIG: Record<PieceType | PromotedPieceType, PieceConfig> = {
  // 通常駒
  king:   { imageSrc: '/icons/lion.png',      hiragana: 'おう'   },
  rook:   { imageSrc: '/icons/washi.png',     hiragana: 'ひしゃ' },
  bishop: { imageSrc: '/icons/fukuro.png',    hiragana: 'かく'   },
  gold:   { imageSrc: '/icons/zou.png',       hiragana: 'きん'   },
  silver: { imageSrc: '/icons/ookami.png',    hiragana: 'ぎん'   },
  knight: { imageSrc: '/icons/rabbit.png',    hiragana: 'けいま' },
  lance:  { imageSrc: '/icons/inoshishi.png', hiragana: 'きょう' },
  pawn:   { imageSrc: '/icons/hiyoko.png',    hiragana: 'ふ'     },
  // 成駒
  promoted_rook:   { imageSrc: '/icons/nari_washi.png',    hiragana: 'りゅうおう' },
  promoted_bishop: { imageSrc: '/icons/nari_fukuro.png',   hiragana: 'りゅうま'   },
  promoted_silver: { imageSrc: '/icons/nari_ookami.png',   hiragana: 'なぎん'     },
  promoted_knight: { imageSrc: '/icons/nari_rabbit.png',   hiragana: 'なけい'     },
  promoted_lance:  { imageSrc: '/icons/nari_inoshishi.png',hiragana: 'なきょ'     },
  promoted_pawn:   { imageSrc: '/icons/niwatori.png',      hiragana: 'ときん'     },
}

export function isPromotedType(type: PieceType | PromotedPieceType): boolean {
  return type.startsWith('promoted_')
}
