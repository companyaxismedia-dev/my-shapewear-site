/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
