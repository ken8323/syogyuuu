import type { Metadata, Viewport } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'

// 子ども向け丸ゴシック（日本語対応）
const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'しょうぎゅー！',
  description: '親子で楽しむ将棋アプリ',
}

// ズーム禁止・スケール固定（iPad専用アプリのため）
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${zenMaruGothic.className} antialiased`}>{children}</body>
    </html>
  )
}
