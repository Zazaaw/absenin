import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { POSTS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl.replace(/\/$/, "");
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...POSTS.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/privasi`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/syarat`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/daftar`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
