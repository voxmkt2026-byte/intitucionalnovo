import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cartas/login.php", "/api/", "/admin/"],
      },
    ],
    sitemap: "https://titaniumconsultorias.com.br/sitemap.xml",
  };
}
