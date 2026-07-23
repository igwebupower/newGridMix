const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Restrict file tracing to this project only (prevents picking up sibling projects)
  outputFileTracingRoot: path.join(__dirname),

  // EVALUATION ONLY (branch: arize-tracing-eval). The OTel instrumentation
  // packages patch modules at require() time via require-in-the-middle, which
  // the bundler breaks; they have to stay external to load correctly on the
  // server. Remove alongside lib/arize-tracing.ts if Arize is not kept.
  serverExternalPackages: [
    '@opentelemetry/instrumentation',
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/exporter-trace-otlp-proto',
    '@arizeai/openinference-instrumentation-openai',
  ],

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

  // Trailing slashes for consistent URLs
  trailingSlash: false,
};

module.exports = nextConfig;
