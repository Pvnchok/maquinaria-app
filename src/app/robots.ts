import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/operador/"],
      },
    ],
    sitemap: "https://maqconnect.cl/sitemap.xml",
  };
}
