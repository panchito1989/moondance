import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Las fotos de la galería se suben vía server action;
      // el límite default (1MB) tira 500 con cualquier foto normal.
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hwmmsjaogunkspjbypza.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
