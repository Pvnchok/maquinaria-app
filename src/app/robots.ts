import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/listings/"],
        disallow: ["/admin/", "/operador/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/listings/"],
        disallow: ["/admin/", "/operador/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: ["/", "/listings/"],
        disallow: ["/admin/", "/operador/", "/api/"],
        crawlDelay: 2,
      },
    ],
    sitemap: "https://maqconnect.cl/sitemap.xml",
    host: "https://maqconnect.cl",
  };
}
