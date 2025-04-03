// Use synchronous imports for Next.js configuration
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
let userConfig = {};

// Check if user config exists and import it
if (existsSync(resolve(__dirname, './v0-user-next.config.js'))) {
  const { default: importedConfig } = await import('./v0-user-next.config.js');
  userConfig = importedConfig || {};
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: async (config, { isServer }) => {
    // Add necessary dependencies to the webpack config
    if (!isServer) {
      // Add MiniCssExtractPlugin
      const { default: MiniCssExtractPlugin } = await import('mini-css-extract-plugin');
      config.plugins.push(new MiniCssExtractPlugin());
      
      // Ensure react-server-dom-webpack is resolved
      const moduleResolver = await import('module');
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-server-dom-webpack/client': moduleResolver.resolve('react-server-dom-webpack/client')
      };
    }
    return config;
  },
}

// Merge user config with default config
for (const key in userConfig) {
  if (
    typeof nextConfig[key] === 'object' &&
    !Array.isArray(nextConfig[key])
  ) {
    nextConfig[key] = {
      ...nextConfig[key],
      ...userConfig[key],
    }
  } else {
    nextConfig[key] = userConfig[key]
  }
}

// Use ES module export
export default nextConfig;
