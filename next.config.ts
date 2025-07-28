import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  images: {
    // Configure domains for Google Cloud Storage and other image sources
    domains: [
      'localhost',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com'
    ],
    // Enable remote patterns for more flexible image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/vision'],
  },
  
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  
  // Optimize for production deployment
  compress: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
