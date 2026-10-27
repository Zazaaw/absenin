import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Halaman dashboard/admin membaca cookie dan DB per request; mode cache komponen dimatikan
  // supaya perilakunya klasik dan mudah ditebak.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        // API dipanggil dari ekstensi Chrome (origin chrome-extension://...). CORS dibuka untuk
        // route API saja; otorisasi tetap lewat kode lisensi di header Authorization.
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Device-Id, X-Extension-Version" },
        ],
      },
    ];
  },
};

export default nextConfig;
