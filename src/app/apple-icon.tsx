import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Apple Touch Icon（#20 SVGアセット完成まで暫定）
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#b45309',
          borderRadius: '32px',
          fontSize: '112px',
        }}
      >
        🦁
      </div>
    ),
    size,
  )
}
