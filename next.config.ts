import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['123.45.2.17', 'localhost'],
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['/data/**', '/proc/**', 'node_modules']
    }
    return config
  }
}

export default nextConfig
