import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    // Screenshots de UI com texto precisam de compressão mais leve para não borrar.
    qualities: [75, 80, 95],
  },
}

export default nextConfig
