import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require('./package.json') as { version: string }

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
}

export default withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // 開発中はSWを無効化（キャッシュによる開発の妨害を防ぐ）
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
