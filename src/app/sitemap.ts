import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://titaniumconsultoria.com.br";
  const lastModified = new Date("2026-06-11");

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/institucional`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cartas/cartas.php?segmento=imovel`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cartas/cartas.php?segmento=veiculo`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
