import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: [
    "3000-1f049c1f-497a-4e3e-998a-28f0973bd003.orchids.cloud",
    "3000-1f049c1f-497a-4e3e-998a-28f0973bd003.proxy.daytona.works",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "3000-1f049c1f-497a-4e3e-998a-28f0973bd003.orchids.cloud",
        "3000-1f049c1f-497a-4e3e-998a-28f0973bd003.proxy.daytona.works",
        "localhost:3000",
      ],
      allowedForwardedHosts: [
        "3000-1f049c1f-497a-4e3e-998a-28f0973bd003.orchids.cloud",
        "3000-1f049c1f-497a-4e3e-998a-28f0973bd003.proxy.daytona.works",
        "localhost:3000",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER]
      }
    }
  }
};

export default nextConfig;
// Orchids restart: 1767374703333
