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
        protocol: "https",
        hostname: "my-shapewear-site.onrender.com",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
