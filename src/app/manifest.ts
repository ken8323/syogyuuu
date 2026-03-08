import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'しょうぎゅー！',
    short_name: 'しょうぎゅー！',
    description: '親子で楽しむ将棋アプリ',
    start_url: '/',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#fffbeb',
    theme_color: '#b45309',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
