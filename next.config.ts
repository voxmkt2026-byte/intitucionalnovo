import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/colaboradores",
        destination: "/representante/",
        permanent: true,
      },
      {
        source: "/colaboradores/:path*",
        destination: "/representante/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "titaniumconsultoria.com.br",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
