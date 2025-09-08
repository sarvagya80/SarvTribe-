import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: 'res.cloudinary.com', // Add this new entry
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com', // Whitelist Apple's image server
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com', // <-- ADD THIS LINE
      },
    ],
  },
};

export default nextConfig;