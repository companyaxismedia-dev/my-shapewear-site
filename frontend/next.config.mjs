/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*', // Change port if backend is different
        },
      ];
    },
  images: {
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
    return [
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