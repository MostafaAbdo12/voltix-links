/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  webpack: (config) => {
    // Disable Webpack Gzip filesystem cache serialization
    // to prevent Gzip buffer allocation OOM on Windows
    config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    return [
      {
        source: '/@:username',
        destination: '/u/:username',
      },
    ];
  },
};

export default nextConfig;
