'use client'

import { getCurrentSeason, type Season } from './seasonUtils'

interface SeasonalBackgroundProps {
  /** 季節パーティクルを表示するか（タイトル画面等では false） */
  showParticles?: boolean
}

// 季節ごとのパーティクル設定
const SEASON_CONFIG: Record<Season, {
  particles: Array<{
    className: string
    style: React.CSSProperties
  }>
}> = {
  spring: {
    particles: Array.from({ length: 12 }, (_, i) => ({
      className: 'seasonal-particle seasonal-sakura',
      style: {
        left: `${(i * 8.3 + 2) % 100}%`,
        animationDelay: `${(i * 1.2) % 8}s`,
        animationDuration: `${8 + (i % 5) * 2}s`,
        opacity: 0.5 + (i % 3) * 0.15,
        width: `${8 + (i % 3) * 4}px`,
        height: `${6 + (i % 3) * 3}px`,
        background: i % 2 === 0 ? '#f9a8d4' : '#fbcfe8',
      },
    })),
  },
  summer: {
    particles: Array.from({ length: 10 }, (_, i) => ({
      className: 'seasonal-particle seasonal-firefly',
      style: {
        left: `${(i * 10 + 5) % 100}%`,
        top: `${(i * 12 + 10) % 80}%`,
        animationDelay: `${(i * 0.8) % 6}s`,
        animationDuration: `${4 + (i % 4) * 1.5}s`,
        width: `${4 + (i % 3) * 2}px`,
        height: `${4 + (i % 3) * 2}px`,
        background: i % 2 === 0 ? '#bef264' : '#a3e635',
      },
    })),
  },
  autumn: {
    particles: Array.from({ length: 12 }, (_, i) => ({
      className: 'seasonal-particle seasonal-leaf',
      style: {
        left: `${(i * 8.3 + 3) % 100}%`,
        animationDelay: `${(i * 1.1) % 8}s`,
        animationDuration: `${9 + (i % 5) * 2}s`,
        opacity: 0.6 + (i % 3) * 0.1,
        width: `${8 + (i % 3) * 3}px`,
        height: `${8 + (i % 3) * 3}px`,
        background: ['#f97316', '#dc2626', '#eab308'][i % 3],
      },
    })),
  },
  winter: {
    particles: Array.from({ length: 15 }, (_, i) => ({
      className: 'seasonal-particle seasonal-snow',
      style: {
        left: `${(i * 6.7 + 1) % 100}%`,
        animationDelay: `${(i * 0.9) % 10}s`,
        animationDuration: `${10 + (i % 6) * 2}s`,
        opacity: 0.4 + (i % 4) * 0.15,
        width: `${4 + (i % 4) * 2}px`,
        height: `${4 + (i % 4) * 2}px`,
        background: i % 3 === 0 ? '#e2e8f0' : '#ffffff',
      },
    })),
  },
}

export function SeasonalBackground({ showParticles = true }: SeasonalBackgroundProps) {
  const season = getCurrentSeason()
  const config = SEASON_CONFIG[season]

  return (
    <>
      {/* 和紙テクスチャオーバーレイ */}
      <div className="washi-texture" aria-hidden="true" />

      {/* 季節パーティクル */}
      {showParticles && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {config.particles.map((particle, i) => (
            <div
              key={i}
              className={particle.className}
              style={particle.style}
            />
          ))}
        </div>
      )}

      {/* 和風角飾り（四隅） */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {/* 左上 */}
        <div className="japanese-corner japanese-corner-tl" />
        {/* 右上 */}
        <div className="japanese-corner japanese-corner-tr" />
        {/* 左下 */}
        <div className="japanese-corner japanese-corner-bl" />
        {/* 右下 */}
        <div className="japanese-corner japanese-corner-br" />
      </div>
    </>
  )
}
