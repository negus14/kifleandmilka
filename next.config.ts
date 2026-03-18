import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ithinkshewifey.com" }],
        destination: "https://ithinkshewifey.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — no one should iframe your site
          { key: "X-Frame-Options", value: "DENY" },
          // Stop browsers from guessing MIME types (prevents XSS via uploaded files)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak full URLs when users click external links
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 1 year (browsers will refuse HTTP connections)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Restrict what can run on your pages — prevents most XSS attacks
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Google Fonts CSS + inline (needed for Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self + Google Fonts + inline (needed for styled-jsx/emotion)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + your R2 bucket + Unsplash + data URIs (for inline images)
              "img-src 'self' https://*.r2.dev https://*.r2.cloudflarestorage.com https://assets.ithinkshewifey.com https://images.unsplash.com data: blob:",
              // iframes: Google Maps embeds only
              "frame-src https://*.google.com https://maps.google.com https://js.stripe.com",
              // API calls: self + Stripe + SMS.to + Resend
              "connect-src 'self' https://*.stripe.com https://api.sms.to https://api.resend.com https://*.r2.cloudflarestorage.com https://*.sentry.io",
              // Forms can only submit to self
              "form-action 'self'",
              // No plugins (Flash, Java, etc.)
              "object-src 'none'",
              // Only load from HTTPS (except localhost for dev)
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "assets.ithinkshewifey.com",
      },
    ],
  },
};

const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "dummy-org",
  project: process.env.SENTRY_PROJECT || "dummy-project",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // tunnelRoute: "/monitoring",

  // Hides source maps from visitors
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
};

export default process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
