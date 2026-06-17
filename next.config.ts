import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async rewrites() {
    return [
      {
        source: "/:path(uber|caminhao|carta-contemplada|maquinas-agricolas|terrenos-construcao|carro-luxo|empresario|medico|placas-solares|aeronaves|embarcacao|carta-comum|corretor|terrenos-agricolas)",
        destination: "/:path/index.html",
      },
    ];
  },
};

export default nextConfig;
