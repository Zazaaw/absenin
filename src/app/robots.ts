import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/checkout", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
