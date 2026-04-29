/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agora SDK relies on browser APIs — must be transpiled
  transpilePackages: ['agora-rtc-sdk-ng'],

  webpack: (config, { isServer }) => {
    // Agora uses some Node-specific module references we need to stub
    if (isServer) {
      config.externals = [...(config.externals || []), 'agora-rtc-sdk-ng'];
    }

    // Suppress critical-dep warnings from Agora's dynamic requires
    config.module.exprContextCritical = false;

    return config;
  },
};

module.exports = nextConfig;
