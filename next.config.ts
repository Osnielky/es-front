import type { NextConfig } from 'next'

const WEEK = 60 * 60 * 24 * 7

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Next 15 streams metadata into <body> for clients it treats as JS-capable (including Googlebot).
  // Google ignores rel=canonical outside <head>, and our metadata reads cached data, so render it in <head> for everyone.
  htmlLimitedBots: /.*/,
  images: {
    deviceSizes: [640, 828, 1080, 1200, 1920],
    // 256 covers 80px thumbnails on 3x phones (240px); without it they jump to 384
    imageSizes: [80, 160, 256, 384],
    formats: ['image/avif', 'image/webp'],
    // 85 for VDP gallery/lightbox photos; Next 16 rejects qualities that aren't listed
    qualities: [75, 85],
    // Vehicle uploads get timestamped filenames and never change, so optimized variants can be cached
    // for 30 days instead of re-encoding every hour (GCS sends max-age=3600)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // public/ files are served with max-age=0 by default; these are large and rarely change
  async headers() {
    const longCache = [{ key: 'Cache-Control', value: `public, max-age=${WEEK}, stale-while-revalidate=${WEEK}` }]
    return [
      { source: '/videos/:path*', headers: longCache },
      { source: '/logo.png', headers: longCache },
      { source: '/logo-512.png', headers: longCache },
    ]
  },
}

export default nextConfig
