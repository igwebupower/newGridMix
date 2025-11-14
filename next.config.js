/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize images for better performance and SEO
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable compression
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Enable powered by header removal for security
  poweredByHeader: false,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Strict mode for better SEO and accessibility
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // Trailing slashes for consistent URLs
  trailingSlash: false,
};

module.exports = nextConfig;
