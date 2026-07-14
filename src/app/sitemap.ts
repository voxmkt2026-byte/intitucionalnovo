import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://titaniumconsultorias.com.br";
  const lastModified = new Date("2026-06-17");

  // Persona landing pages (static HTML in /public/)
  const personas = [
    "uber", "caminhao", "carta-contemplada", "carro-luxo", "empresario",
    "medico", "maquinas-agricolas", "aeronaves", "placas-solares",
    "embarcacao", "terrenos-construcao", "terrenos-agricolas", "corretor", "carta-comum",
  ];

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
      url: `${baseUrl}/missao-visao-valores`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trajetoria`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cartas-contempladas`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...personas.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
