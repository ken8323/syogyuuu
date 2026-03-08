import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

// アプリアイコン（#20 SVGアセット完成まで暫定: ライオン絵文字 + amber背景）
export default function Icon() {
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
          fontSize: '120px',
        }}
      >
        🦁
      </div>
    ),
    size,
  )
}
