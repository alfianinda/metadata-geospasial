import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' blob: data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https:; style-src 'self' 'unsafe-inline' blob: data: https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: blob: data: ws: wss:; media-src 'self' blob: data: https:; object-src 'none'; frame-src 'none'; worker-src 'self' blob: data: https:;"
          }
        ]
      },
      {
        // API routes - stricter CSP
        source: '/api/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self';"
          }
        ]
      }
    ]
  },
  // Experimental features for security
  experimental: {},
  serverExternalPackages: [],
  // Production optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;

