import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

    if (!apiUrl) return [];

    // Keep auth on the client origin so OAuth callbacks and session cookies
    // use the client URL, while the Express API still handles the requests.
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },

  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
