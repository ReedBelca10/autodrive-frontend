import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
  eslint: {
    // Avertissement : cela permet de construire en production même s'il y a des erreurs ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Avertissement : cela permet de construire en production même s'il y a des erreurs TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
