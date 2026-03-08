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

// ライオン（王将）: アンバーのたてがみ + ブラッシュ + ひげ
export function Lion({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* たてがみ（アンバー固定） */}
      <circle cx="50" cy="52" r="46" fill="#F59E0B" />
      {/* 顔 */}
      <circle cx="50" cy="54" r="32" fill={primary} />
      {/* 小さな三角耳 */}
      <polygon points="24,34 16,14 36,28" fill={dark} />
      <polygon points="76,34 84,14 64,28" fill={dark} />
      {/* 目（大きめ） */}
      <circle cx="37" cy="47" r="11" fill="white" />
      <circle cx="63" cy="47" r="11" fill="white" />
      <circle cx="38" cy="48" r="6" fill="#1a1a1a" />
      <circle cx="64" cy="48" r="6" fill="#1a1a1a" />
      <circle cx="40" cy="45" r="2.5" fill="white" />
      <circle cx="66" cy="45" r="2.5" fill="white" />
      {/* ブラッシュ（ほっぺのピンク） */}
      <ellipse cx="24" cy="58" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="76" cy="58" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      {/* 鼻 */}
      <ellipse cx="50" cy="60" rx="5" ry="3.5" fill={dark} />
      {/* 笑顔 */}
      <path d="M43 67 Q50 74 57 67" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* ひげ */}
      <line x1="8" y1="58" x2="40" y2="61" stroke={dark} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="8" y1="65" x2="40" y2="65" stroke={dark} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="60" y1="61" x2="92" y2="58" stroke={dark} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="60" y1="65" x2="92" y2="65" stroke={dark} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// たか（飛車・竜王）: 丸い頭 + 大きな翼 + くちばし
export function Hawk({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 翼（ふわっと大きく） */}
      <ellipse cx="16" cy="68" rx="22" ry="12" fill={dark} transform="rotate(-30 16 68)" />
      <ellipse cx="84" cy="68" rx="22" ry="12" fill={dark} transform="rotate(30 84 68)" />
      {/* 体 */}
      <ellipse cx="50" cy="76" rx="20" ry="18" fill={primary} />
      {/* 頭 */}
      <circle cx="50" cy="40" r="30" fill={primary} />
      {/* 目（大きめ） */}
      <circle cx="37" cy="36" r="10" fill="white" />
      <circle cx="63" cy="36" r="10" fill="white" />
      <circle cx="38" cy="37" r="5.5" fill="#1a1a1a" />
      <circle cx="64" cy="37" r="5.5" fill="#1a1a1a" />
      <circle cx="40" cy="34" r="2.2" fill="white" />
      <circle cx="66" cy="34" r="2.2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="24" cy="48" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="76" cy="48" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      {/* くちばし（オレンジ三角） */}
      <path d="M38 50 L50 62 L62 50 Z" fill="#F97316" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// フクロウ（角行・竜馬）: 超大きな丸い目 + 耳ふさ + ハート型顔
export function Owl({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 耳ふさ（三角・尖った） */}
      <polygon points="28,26 18,4 42,20" fill={dark} />
      <polygon points="72,26 82,4 58,20" fill={dark} />
      {/* 顔 */}
      <circle cx="50" cy="58" r="36" fill={primary} />
      {/* 目のリング（白い大きな円） */}
      <circle cx="33" cy="50" r="18" fill="white" />
      <circle cx="67" cy="50" r="18" fill="white" />
      {/* 瞳 */}
      <circle cx="33" cy="51" r="11" fill="#1a1a1a" />
      <circle cx="67" cy="51" r="11" fill="#1a1a1a" />
      {/* 目のハイライト */}
      <circle cx="36" cy="46" r="4" fill="white" />
      <circle cx="70" cy="46" r="4" fill="white" />
      <circle cx="30" cy="55" r="2" fill="white" opacity="0.5" />
      <circle cx="64" cy="55" r="2" fill="white" opacity="0.5" />
      {/* ブラッシュ */}
      <ellipse cx="16" cy="66" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="84" cy="66" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      {/* くちばし（小さな三角） */}
      <path d="M43 66 L50 75 L57 66 Z" fill="#F97316" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// ゾウ（金将）: 大きな丸耳 + 可愛い鼻
export function Elephant({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 大きな丸耳 */}
      <circle cx="10" cy="46" r="18" fill={dark} />
      <circle cx="90" cy="46" r="18" fill={dark} />
      <circle cx="10" cy="46" r="12" fill={primary} opacity="0.5" />
      <circle cx="90" cy="46" r="12" fill={primary} opacity="0.5" />
      {/* 顔 */}
      <circle cx="50" cy="44" r="32" fill={primary} />
      {/* 目（大きめ） */}
      <circle cx="36" cy="37" r="10" fill="white" />
      <circle cx="64" cy="37" r="10" fill="white" />
      <circle cx="37" cy="38" r="5.5" fill="#1a1a1a" />
      <circle cx="65" cy="38" r="5.5" fill="#1a1a1a" />
      <circle cx="39" cy="35" r="2.2" fill="white" />
      <circle cx="67" cy="35" r="2.2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="22" cy="50" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="78" cy="50" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      {/* 可愛い鼻（くるんとカール） */}
      <path d="M50 58 Q52 72 44 80 Q38 86 42 92" stroke={dark} strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* 笑顔 */}
      <path d="M42 54 Q50 60 58 54" stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// オオカミ（銀将・成銀）: 尖った三角耳 + 牙
export function Wolf({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 三角耳（尖った） */}
      <polygon points="18,42 8,6 38,30" fill={dark} />
      <polygon points="82,42 92,6 62,30" fill={dark} />
      <polygon points="22,40 14,16 36,32" fill={primary} opacity="0.5" />
      <polygon points="78,40 86,16 64,32" fill={primary} opacity="0.5" />
      {/* 顔 */}
      <circle cx="50" cy="52" r="34" fill={primary} />
      {/* 口元（マズル部分を白っぽく） */}
      <ellipse cx="50" cy="68" rx="16" ry="12" fill="white" opacity="0.3" />
      {/* 目（大きめ） */}
      <circle cx="35" cy="44" r="10" fill="white" />
      <circle cx="65" cy="44" r="10" fill="white" />
      <circle cx="36" cy="45" r="5.5" fill="#1a1a1a" />
      <circle cx="66" cy="45" r="5.5" fill="#1a1a1a" />
      <circle cx="38" cy="42" r="2.2" fill="white" />
      <circle cx="68" cy="42" r="2.2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="21" cy="56" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="79" cy="56" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      {/* 鼻 */}
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill={dark} />
      {/* 牙（小さく可愛く） */}
      <polygon points="43,72 41,82 47,72" fill="white" />
      <polygon points="57,72 59,82 53,72" fill="white" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// うさぎ（桂馬・成桂）: 長～い耳 + ピンクの内耳 + 前歯
export function Rabbit({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 長い耳（特徴的） */}
      <ellipse cx="32" cy="22" rx="14" ry="28" fill={primary} />
      <ellipse cx="68" cy="22" rx="14" ry="28" fill={primary} />
      {/* 耳の内側（ピンク） */}
      <ellipse cx="32" cy="22" rx="8" ry="22" fill="#FFB7C5" opacity="0.7" />
      <ellipse cx="68" cy="22" rx="8" ry="22" fill="#FFB7C5" opacity="0.7" />
      {/* 顔 */}
      <circle cx="50" cy="66" r="28" fill={primary} />
      {/* 目（大きめ） */}
      <circle cx="38" cy="60" r="9" fill="white" />
      <circle cx="62" cy="60" r="9" fill="white" />
      <circle cx="39" cy="61" r="5" fill="#1a1a1a" />
      <circle cx="63" cy="61" r="5" fill="#1a1a1a" />
      <circle cx="41" cy="58" r="2" fill="white" />
      <circle cx="65" cy="58" r="2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="24" cy="70" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="76" cy="70" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      {/* 鼻（ピンク） */}
      <ellipse cx="50" cy="69" rx="4" ry="3" fill="#FFB7C5" />
      {/* 前歯（可愛く） */}
      <rect x="44" y="74" width="5" height="7" rx="2" fill="white" />
      <rect x="51" y="74" width="5" height="7" rx="2" fill="white" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// イノシシ（香車・成香）: 大きな豚鼻 + 牙
export function Boar({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 小さな丸耳 */}
      <circle cx="24" cy="20" r="14" fill={dark} />
      <circle cx="76" cy="20" r="14" fill={dark} />
      <circle cx="24" cy="20" r="9" fill={primary} opacity="0.5" />
      <circle cx="76" cy="20" r="9" fill={primary} opacity="0.5" />
      {/* 顔 */}
      <circle cx="50" cy="52" r="36" fill={primary} />
      {/* 目（大きめ） */}
      <circle cx="34" cy="42" r="10" fill="white" />
      <circle cx="66" cy="42" r="10" fill="white" />
      <circle cx="35" cy="43" r="5.5" fill="#1a1a1a" />
      <circle cx="67" cy="43" r="5.5" fill="#1a1a1a" />
      <circle cx="37" cy="40" r="2.2" fill="white" />
      <circle cx="69" cy="40" r="2.2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="20" cy="56" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="80" cy="56" rx="10" ry="7" fill="#FFB7C5" opacity="0.8" />
      {/* 大きな丸鼻（豚鼻！イノシシの特徴） */}
      <ellipse cx="50" cy="68" rx="18" ry="14" fill={dark} opacity="0.9" />
      <circle cx="43" cy="69" r="5.5" fill={primary} opacity="0.6" />
      <circle cx="57" cy="69" r="5.5" fill={primary} opacity="0.6" />
      {/* 牙（上向き白い曲線） */}
      <path d="M30 76 Q26 88 34 88" stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M70 76 Q74 88 66 88" stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// ひよこ（歩兵）: ぷっくり丸体 + 小さなくちばし
export function Chick({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 体（ぷっくり） */}
      <ellipse cx="50" cy="76" rx="30" ry="22" fill={primary} />
      {/* 翼のヒント */}
      <ellipse cx="24" cy="76" rx="8" ry="14" fill={dark} opacity="0.4" transform="rotate(-10 24 76)" />
      <ellipse cx="76" cy="76" rx="8" ry="14" fill={dark} opacity="0.4" transform="rotate(10 76 76)" />
      {/* 頭 */}
      <circle cx="50" cy="40" r="28" fill={primary} />
      {/* 目（大きめくりくり） */}
      <circle cx="38" cy="36" r="10" fill="white" />
      <circle cx="62" cy="36" r="10" fill="white" />
      <circle cx="39" cy="37" r="5.5" fill="#1a1a1a" />
      <circle cx="63" cy="37" r="5.5" fill="#1a1a1a" />
      <circle cx="41" cy="34" r="2.2" fill="white" />
      <circle cx="65" cy="34" r="2.2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="24" cy="47" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="76" cy="47" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      {/* くちばし（小さなオレンジ三角） */}
      <path d="M42 48 L50 57 L58 48 Z" fill="#F97316" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}

// ニワトリ（と金）: 赤いとさか + ひよこが成長
export function Chicken({ primary, dark, isPromoted }: AnimalProps) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* とさか（赤固定・目立つ） */}
      <path d="M34 24 Q38 4 46 12 Q50 2 54 12 Q62 4 66 24" fill="#EF4444" />
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="28" ry="20" fill={primary} />
      {/* 翼 */}
      <ellipse cx="24" cy="80" rx="10" ry="16" fill={dark} opacity="0.5" transform="rotate(-15 24 80)" />
      <ellipse cx="76" cy="80" rx="10" ry="16" fill={dark} opacity="0.5" transform="rotate(15 76 80)" />
      {/* 頭 */}
      <circle cx="50" cy="44" r="26" fill={primary} />
      {/* 目（大きめ） */}
      <circle cx="37" cy="40" r="9" fill="white" />
      <circle cx="63" cy="40" r="9" fill="white" />
      <circle cx="38" cy="41" r="5" fill="#1a1a1a" />
      <circle cx="64" cy="41" r="5" fill="#1a1a1a" />
      <circle cx="40" cy="38" r="2" fill="white" />
      <circle cx="66" cy="38" r="2" fill="white" />
      {/* ブラッシュ */}
      <ellipse cx="23" cy="50" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      <ellipse cx="77" cy="50" rx="9" ry="6" fill="#FFB7C5" opacity="0.8" />
      {/* くちばし（オレンジ） */}
      <path d="M41 50 L50 60 L59 50 Z" fill="#F97316" />
      {/* 肉垂（赤固定） */}
      <ellipse cx="50" cy="66" rx="8" ry="6" fill="#EF4444" />
      {isPromoted && <PromotedBadge />}
    </svg>
  )
}
