import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'

const nextConfig: NextConfig = {}

export default withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // 開発中はSWを無効化（キャッシュによる開発の妨害を防ぐ）
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
