/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://my-shapewear-site.onrender.com";

const nextConfig = {
    poweredByHeader: false,
    // Allow opening dev server from LAN/mobile
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://192.168.1.6:3000",
      "http://192.168.1.5:3001",
    ],
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${API_BASE}/api/:path*`,
        },
      ];
    },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/image/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "my-shapewear-site.onrender.com",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "my-shapewear-site.onrender.com",
        pathname: "/uploads/**",
      },

      // ADD THIS
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },

  // Cache headers configuration
  async headers() {
    const securityHeaders = [
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "Content-Security-Policy",
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:5000 http://127.0.0.1:5000 https://my-shapewear-site.onrender.com https://images.unsplash.com; font-src 'self' data:; connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 https://my-shapewear-site.onrender.com https://accounts.google.com https://checkout.razorpay.com; frame-src https://accounts.google.com https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Admin pages - Cache with ISR for 60 seconds
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
          {
            key: "CDN-Cache-Control",
            value: "max-age=60",
          },
        ],
      },
      // Static assets - Cache for 1 year
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Public assets - Cache for 1 month
      {
        source: "/:path*[.svg|.png|.jpg|.jpeg|.gif|.webp|.ico]",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      // API routes - Cache dynamically
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },

  // Optimize compression
  compress: true,

  // Enable SWR (stale-while-revalidate)
  // swcMinify: true,
};

export default nextConfig;
