/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for jsPDF in Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Note: In Next.js 14 with App Router, body parsing is handled automatically
  // For webhooks that need raw body access, configure it in the route handler
  // using: export const config = { api: { bodyParser: false } }
};

module.exports = nextConfig;
