import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { PIECE_CONFIG } from '@/components/Piece/pieceConfig'

const PUBLIC_DIR = path.resolve(__dirname, '../../public')

describe('PWA オフライン対応', () => {
  describe('manifest.ts の設定', () => {
    const manifestContent = fs.readFileSync(
      path.resolve(__dirname, '../app/manifest.ts'),
      'utf-8',
    )

    it('アプリ名が正しい', () => {
      expect(manifestContent).toContain("name: 'しょうぎゅー！'")
      expect(manifestContent).toContain("short_name: 'しょうぎゅー！'")
    })

    it('standalone モードで横向き固定', () => {
      expect(manifestContent).toContain("display: 'standalone'")
      expect(manifestContent).toContain("orientation: 'landscape'")
    })

    it('start_url が / である', () => {
      expect(manifestContent).toContain("start_url: '/'")
    })

    it('アイコンが 192x192 と 512x512 の2サイズ定義されている', () => {
      expect(manifestContent).toContain("sizes: '192x192'")
      expect(manifestContent).toContain("sizes: '512x512'")
    })

    it('テーマカラーと背景色が設定されている', () => {
      expect(manifestContent).toContain('theme_color:')
      expect(manifestContent).toContain('background_color:')
    })
  })

  describe('駒画像ファイルの存在確認', () => {
    const allPieceConfigs = Object.entries(PIECE_CONFIG)

    it.each(allPieceConfigs)(
      '%s の画像ファイルが public/ に存在する',
      (_pieceType, config) => {
        // imageSrc は "/icons/xxx.webp" 形式
        const filePath = path.join(PUBLIC_DIR, config.imageSrc)
        expect(fs.existsSync(filePath)).toBe(true)
      },
    )

    it('全駒画像が WebP 形式である', () => {
      for (const [, config] of allPieceConfigs) {
        expect(config.imageSrc).toMatch(/\.webp$/)
      }
    })
  })

  describe('pieceConfig と precache 対象の整合性', () => {
    // next.config.ts の pieceImageEntries と同じリストを検証
    const PRECACHE_PIECE_IMAGES = [
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
    ]

    it('pieceConfig の全画像が precache 対象に含まれている', () => {
      const configImages = Object.values(PIECE_CONFIG).map((c) => c.imageSrc)
      for (const img of configImages) {
        expect(PRECACHE_PIECE_IMAGES).toContain(img)
      }
    })

    it('precache 対象の全画像が pieceConfig で使用されている（不要エントリがない）', () => {
      const configImages = Object.values(PIECE_CONFIG).map((c) => c.imageSrc)
      for (const img of PRECACHE_PIECE_IMAGES) {
        expect(configImages).toContain(img)
      }
    })
  })

  describe('Service Worker 設定', () => {
    it('sw.ts が存在する', () => {
      const swPath = path.resolve(__dirname, '../app/sw.ts')
      expect(fs.existsSync(swPath)).toBe(true)
    })

    it('sw.ts に必須設定が含まれている', () => {
      const swPath = path.resolve(__dirname, '../app/sw.ts')
      const swContent = fs.readFileSync(swPath, 'utf-8')

      // precache マニフェスト注入
      expect(swContent).toContain('self.__SW_MANIFEST')
      // アクティベーション即時反映
      expect(swContent).toContain('skipWaiting: true')
      expect(swContent).toContain('clientsClaim: true')
      // デフォルトキャッシュ戦略
      expect(swContent).toContain('defaultCache')
    })
  })

  describe('next.config.ts の precache 設定', () => {
    it('next.config.ts に駒画像の additionalPrecacheEntries が設定されている', () => {
      const configPath = path.resolve(__dirname, '../../next.config.ts')
      const configContent = fs.readFileSync(configPath, 'utf-8')

      expect(configContent).toContain('additionalPrecacheEntries')
      // 全駒画像パスが含まれている
      expect(configContent).toContain('/icons/lion.webp')
      expect(configContent).toContain('/icons/hiyoko.webp')
      expect(configContent).toContain('/icons/niwatori.webp')
      expect(configContent).toContain('/icons/nari_washi.webp')
    })
  })

  describe('フォント設定', () => {
    it('layout.tsx で Zen Maru Gothic が swap 指定で読み込まれている', () => {
      const layoutPath = path.resolve(__dirname, '../app/layout.tsx')
      const layoutContent = fs.readFileSync(layoutPath, 'utf-8')

      expect(layoutContent).toContain('Zen_Maru_Gothic')
      expect(layoutContent).toContain("display: 'swap'")
    })
  })
})
