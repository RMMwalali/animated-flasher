import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const s3Host = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : undefined

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  poweredByHeader: false,
  agentRules: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: s3Host ? [{ protocol: 'https', hostname: s3Host }] : [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  experimental: {
    optimizePackageImports: ['gsap', '@headlessui/react'],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
