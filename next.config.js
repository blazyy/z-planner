/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        // Canonicalize the auto-assigned Vercel domain onto the custom domain
        // where the Clerk production instance is configured. Permanent (308)
        // now that the cutover is verified stable.
        source: '/:path*',
        has: [{ type: 'host', value: 'zenith-planner.vercel.app' }],
        destination: 'https://zplanner.faaez.co.in/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    // Content-Security-Policy tuned for Clerk on Next.js.
    // Refs: Clerk's documented CSP guidance for Next.js apps.
    // - script-src needs 'unsafe-inline' for Next.js' inline bootstrap scripts
    //   (Clerk-sanctioned); 'unsafe-eval' is only required by Next in dev.
    // - connect-src/frame-src/img-src/worker-src cover Clerk FAPI, telemetry,
    //   avatars, web workers, and Turnstile bot protection.
    // NOTE: clerk.zplanner.faaez.co.in is the assumed production Frontend API
    //   host. Confirm against the real Clerk FAPI domain for this instance.
    const isProd = process.env.NODE_ENV === 'production'
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      ...(isProd ? [] : ["'unsafe-eval'"]),
      'https://*.clerk.accounts.dev',
      'https://clerk.zplanner.faaez.co.in',
      'https://*.clerk.com',
      'https://challenges.cloudflare.com',
    ].join(' ')

    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "connect-src 'self' https://*.clerk.accounts.dev https://clerk.zplanner.faaez.co.in https://*.clerk.com",
      "worker-src 'self' blob:",
      "img-src 'self' data: https://img.clerk.com https://*.clerk.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
