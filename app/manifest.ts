import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ViewLingo - Learn Languages with Smart Glasses',
    short_name: 'ViewLingo',
    description: 'The best way to learn languages using smart glasses',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F0F0',
    theme_color: '#000000',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['education', 'productivity'],
    lang: 'en',
  }
} 