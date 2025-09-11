import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Reduce memory pressure during development by disabling persistent FS cache
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Use in-memory cache to avoid large array buffer allocations during dev
      config.cache = { type: 'memory' };
    }
    
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'pixoeditor.com',
      },
    ],
    // Optimize images for better performance
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Optimize bundle size
  swcMinify: true,
};

export default nextConfig;