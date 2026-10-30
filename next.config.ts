import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.firebaseapp.com https://apis.google.com",
      "connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.supabase.co wss://*.supabase.co https://*.r2.cloudflarestorage.com https://*.firebaseapp.com https://*.googleapis.com https://identitytoolkit.googleapis.com",
      "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:* https://*.supabase.co https://*.r2.cloudflarestorage.com https://*.googleusercontent.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Disable production source maps to avoid leaking source code and business logic
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
