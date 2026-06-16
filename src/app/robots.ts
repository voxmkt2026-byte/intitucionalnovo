import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cartas/login.php", "/api/"],
      },
    ],
    sitemap: "https://titaniumconsultoria.com.br/sitemap.xml",
  };
}
