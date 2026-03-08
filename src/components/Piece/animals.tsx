'use client'

export interface AnimalColors {
  primary: string // 顔・体のメインカラー
  dark: string    // 輪郭・詳細カラー
}

interface AnimalProps extends AnimalColors {
  isPromoted?: boolean
}

// 成駒バッジ（右上に金色の★）
function PromotedBadge() {
  return (
    <g>
      <circle cx="83" cy="17" r="14" fill="#F59E0B" stroke="white" strokeWidth="2" />
      <text x="83" y="23" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">
        ★
      </text>
    </g>
  )
}

// ライオン（王将）: たてがみ + ひげ
export function Lion({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* たてがみ */}
      <circle cx="50" cy="50" r="44" fill={dark} />
      {/* 顔 */}
      <circle cx="50" cy="53" r="30" fill={primary} />
      {/* 目（白目 → 黒目 → ハイライト） */}
      <circle cx="37" cy="47" r="7" fill="white" />
      <circle cx="63" cy="47" r="7" fill="white" />
      <circle cx="38" cy="48" r="3.5" fill="#1a1a1a" />
      <circle cx="64" cy="48" r="3.5" fill="#1a1a1a" />
      <circle cx="39" cy="46" r="1.5" fill="white" />
      <circle cx="65" cy="46" r="1.5" fill="white" />
      {/* 鼻 */}
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill={dark} />
      {/* 口 */}
      <path d="M44 64 Q50 70 56 64" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* ひげ */}
      <line x1="10" y1="56" x2="42" y2="59" stroke={dark} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="63" x2="42" y2="63" stroke={dark} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="58" y1="59" x2="90" y2="56" stroke={dark} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="58" y1="63" x2="90" y2="63" stroke={dark} strokeWidth="1.5" strokeLinecap="round" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// たか（飛車・竜王）: くちばし + 翼
export function Hawk({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 翼 */}
      <ellipse cx="18" cy="65" rx="20" ry="10" fill={dark} transform="rotate(-25 18 65)" />
      <ellipse cx="82" cy="65" rx="20" ry="10" fill={dark} transform="rotate(25 82 65)" />
      {/* 体 */}
      <ellipse cx="50" cy="72" rx="22" ry="20" fill={primary} />
      {/* 頭 */}
      <circle cx="50" cy="38" r="28" fill={primary} />
      {/* 目 */}
      <circle cx="37" cy="34" r="7" fill="white" />
      <circle cx="63" cy="34" r="7" fill="white" />
      <circle cx="38" cy="35" r="3.5" fill="#1a1a1a" />
      <circle cx="64" cy="35" r="3.5" fill="#1a1a1a" />
      <circle cx="39" cy="33" r="1.5" fill="white" />
      <circle cx="65" cy="33" r="1.5" fill="white" />
      {/* くちばし（下向き三角） */}
      <path d="M40 46 L50 60 L60 46 Z" fill={dark} />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// フクロウ（角行・竜馬）: 超大きな目 + 耳ふさ
export function Owl({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 耳ふさ（三角） */}
      <polygon points="26,24 16,2 40,18" fill={dark} />
      <polygon points="74,24 84,2 60,18" fill={dark} />
      {/* 顔 */}
      <circle cx="50" cy="56" r="36" fill={primary} />
      {/* 大きな目（フクロウの特徴） */}
      <circle cx="34" cy="50" r="16" fill="white" />
      <circle cx="66" cy="50" r="16" fill="white" />
      <circle cx="34" cy="51" r="10" fill="#1a1a1a" />
      <circle cx="66" cy="51" r="10" fill="#1a1a1a" />
      <circle cx="36" cy="47" r="3.5" fill="white" />
      <circle cx="68" cy="47" r="3.5" fill="white" />
      {/* 小さなくちばし */}
      <path d="M43 64 L50 72 L57 64 Z" fill={dark} />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// ゾウ（金将）: 大耳 + 鼻
export function Elephant({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 大きな耳 */}
      <ellipse cx="12" cy="46" rx="16" ry="24" fill={dark} />
      <ellipse cx="88" cy="46" rx="16" ry="24" fill={dark} />
      {/* 顔 */}
      <circle cx="50" cy="44" r="32" fill={primary} />
      {/* 目 */}
      <circle cx="36" cy="37" r="7" fill="white" />
      <circle cx="64" cy="37" r="7" fill="white" />
      <circle cx="37" cy="38" r="3.5" fill="#1a1a1a" />
      <circle cx="65" cy="38" r="3.5" fill="#1a1a1a" />
      <circle cx="38" cy="36" r="1.5" fill="white" />
      <circle cx="66" cy="36" r="1.5" fill="white" />
      {/* 鼻（trunk: 下に伸びてカール） */}
      <path d="M50 58 Q50 78 40 84 Q34 88 36 94" stroke={dark} strokeWidth="8" fill="none" strokeLinecap="round" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// オオカミ（銀将・成銀）: 三角耳 + 牙
export function Wolf({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 三角耳 */}
      <polygon points="20,44 10,6 40,30" fill={dark} />
      <polygon points="80,44 90,6 60,30" fill={dark} />
      {/* 顔 */}
      <ellipse cx="50" cy="54" rx="34" ry="36" fill={primary} />
      {/* 口元（マズル） */}
      <ellipse cx="50" cy="70" rx="18" ry="13" fill={dark} opacity="0.35" />
      {/* 目 */}
      <circle cx="35" cy="46" r="7" fill="white" />
      <circle cx="65" cy="46" r="7" fill="white" />
      <circle cx="36" cy="47" r="3.5" fill="#1a1a1a" />
      <circle cx="66" cy="47" r="3.5" fill="#1a1a1a" />
      <circle cx="37" cy="45" r="1.5" fill="white" />
      <circle cx="67" cy="45" r="1.5" fill="white" />
      {/* 鼻 */}
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill={dark} />
      {/* 牙 */}
      <polygon points="42,74 39,86 47,74" fill="white" />
      <polygon points="58,74 61,86 53,74" fill="white" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// うさぎ（桂馬・成桂）: 長い耳（識別特徴）
export function Rabbit({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 長い耳 */}
      <ellipse cx="33" cy="24" rx="13" ry="28" fill={primary} />
      <ellipse cx="67" cy="24" rx="13" ry="28" fill={primary} />
      <ellipse cx="33" cy="24" rx="7" ry="22" fill={dark} opacity="0.3" />
      <ellipse cx="67" cy="24" rx="7" ry="22" fill={dark} opacity="0.3" />
      {/* 顔 */}
      <circle cx="50" cy="66" r="28" fill={primary} />
      {/* 目 */}
      <circle cx="38" cy="60" r="6" fill="white" />
      <circle cx="62" cy="60" r="6" fill="white" />
      <circle cx="39" cy="61" r="3" fill="#1a1a1a" />
      <circle cx="63" cy="61" r="3" fill="#1a1a1a" />
      <circle cx="40" cy="59" r="1" fill="white" />
      <circle cx="64" cy="59" r="1" fill="white" />
      {/* 鼻 */}
      <ellipse cx="50" cy="69" rx="4" ry="3" fill={dark} />
      {/* 前歯 */}
      <rect x="44" y="74" width="5" height="8" rx="1.5" fill="white" />
      <rect x="51" y="74" width="5" height="8" rx="1.5" fill="white" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// イノシシ（香車・成香）: 大きな丸鼻 + 牙
export function Boar({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 小さな丸耳 */}
      <circle cx="24" cy="22" r="14" fill={dark} />
      <circle cx="76" cy="22" r="14" fill={dark} />
      {/* 顔 */}
      <circle cx="50" cy="50" r="36" fill={primary} />
      {/* 目 */}
      <circle cx="34" cy="41" r="7" fill="white" />
      <circle cx="66" cy="41" r="7" fill="white" />
      <circle cx="35" cy="42" r="3.5" fill="#1a1a1a" />
      <circle cx="67" cy="42" r="3.5" fill="#1a1a1a" />
      <circle cx="36" cy="40" r="1.5" fill="white" />
      <circle cx="68" cy="40" r="1.5" fill="white" />
      {/* 大きな丸鼻（イノシシの識別特徴） */}
      <ellipse cx="50" cy="65" rx="20" ry="16" fill={dark} />
      <circle cx="42" cy="66" r="6" fill={primary} opacity="0.5" />
      <circle cx="58" cy="66" r="6" fill={primary} opacity="0.5" />
      {/* 牙 */}
      <path d="M30 74 Q24 88 32 90" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M70 74 Q76 88 68 90" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// ひよこ（歩兵）: 丸体 + 小さなくちばし
export function Chick({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 体（丸くてふっくら） */}
      <ellipse cx="50" cy="74" rx="28" ry="22" fill={primary} />
      {/* 頭 */}
      <circle cx="50" cy="40" r="26" fill={primary} />
      {/* 目 */}
      <circle cx="39" cy="36" r="6" fill="white" />
      <circle cx="61" cy="36" r="6" fill="white" />
      <circle cx="40" cy="37" r="3" fill="#1a1a1a" />
      <circle cx="62" cy="37" r="3" fill="#1a1a1a" />
      <circle cx="41" cy="35" r="1" fill="white" />
      <circle cx="63" cy="35" r="1" fill="white" />
      {/* 小さなくちばし */}
      <path d="M41 47 L50 56 L59 47 Z" fill={dark} />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// ニワトリ（と金）: とさか（赤） + 肉垂
export function Chicken({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* とさか（赤固定） */}
      <path d="M36 24 Q40 4 50 12 Q56 2 62 12 Q70 4 68 24" fill="#EF4444" />
      {/* 体 */}
      <ellipse cx="50" cy="76" rx="28" ry="20" fill={primary} />
      {/* 羽 */}
      <ellipse cx="26" cy="78" rx="10" ry="18" fill={dark} opacity="0.4" transform="rotate(-20 26 78)" />
      <ellipse cx="74" cy="78" rx="10" ry="18" fill={dark} opacity="0.4" transform="rotate(20 74 78)" />
      {/* 頭 */}
      <circle cx="50" cy="42" r="24" fill={primary} />
      {/* 目 */}
      <circle cx="38" cy="38" r="6" fill="white" />
      <circle cx="62" cy="38" r="6" fill="white" />
      <circle cx="39" cy="39" r="3" fill="#1a1a1a" />
      <circle cx="63" cy="39" r="3" fill="#1a1a1a" />
      <circle cx="40" cy="37" r="1" fill="white" />
      <circle cx="64" cy="37" r="1" fill="white" />
      {/* くちばし */}
      <path d="M41 48 L50 57 L59 48 Z" fill={dark} />
      {/* 肉垂（あごのたれ・赤固定） */}
      <path d="M44 60 Q50 68 56 60" fill="#EF4444" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}
