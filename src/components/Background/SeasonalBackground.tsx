'use client'

export function SeasonalBackground() {
  return (
    <>
      {/* 和紙テクスチャオーバーレイ */}
      <div className="washi-texture" aria-hidden="true" />

      {/* 和風角飾り（四隅） */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="japanese-corner japanese-corner-tl" />
        <div className="japanese-corner japanese-corner-tr" />
        <div className="japanese-corner japanese-corner-bl" />
        <div className="japanese-corner japanese-corner-br" />
      </div>
    </>
  )
}
