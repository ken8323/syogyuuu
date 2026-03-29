import { spawnSync } from 'node:child_process'
import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require('./package.json') as { version: string }

// 駒画像のキャッシュバスティング用リビジョン
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout.trim() || crypto.randomUUID()

// オフラインで必須となる駒画像を事前キャッシュ
const pieceImageEntries = [
  '/icons/lion.webp',
  '/icons/washi.webp',
  '/icons/fukuro.webp',
  '/icons/zou.webp',
  '/icons/ookami.webp',
  '/icons/rabbit.webp',
  '/icons/inoshishi.webp',
  '/icons/hiyoko.webp',
  '/icons/nari_washi.webp',
  '/icons/nari_fukuro.webp',
  '/icons/nari_ookami.webp',
  '/icons/nari_rabbit.webp',
  '/icons/nari_inoshishi.webp',
  '/icons/niwatori.webp',
].map((url) => ({ url, revision }))

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
  additionalPrecacheEntries: pieceImageEntries,
})(nextConfig)
