/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        // Canonicalize the auto-assigned Vercel domain onto the custom domain
        // where the Clerk production instance is configured. 307 during cutover
        // so browsers don't hard-cache it; flip to permanent once stable.
        source: '/:path*',
        has: [{ type: 'host', value: 'zenith-planner.vercel.app' }],
        destination: 'https://zplanner.faaez.co.in/:path*',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
