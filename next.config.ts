import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin HTML paste upload can be large
      bodySizeLimit: "4mb",
    },
  },
  outputFileTracingIncludes: {
    "/s/[slug]": ["./src/lib/admin-html/**/*"],
    "/admin/pages": ["./src/lib/admin-html/**/*"],
  },
};

export default nextConfig;
