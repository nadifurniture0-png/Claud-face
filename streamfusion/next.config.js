/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agora SDK relies on browser APIs — must be transpiled on client only
  transpilePackages: ['agora-rtc-sdk-ng'],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Completely exclude Agora from the server bundle
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'agora-rtc-sdk-ng',
      ];
    }

    // Stub browser globals that Agora references at module parse time
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs:   false,
        net:  false,
        tls:  false,
      },
    };

    // Suppress critical-dep warnings from Agora's dynamic requires
    config.module.exprContextCritical = false;

    return config;
  },

  // Ensure Agora components are never pre-rendered on the server
  experimental: {
    serverComponentsExternalPackages: ['agora-rtc-sdk-ng'],
  },
};

module.exports = nextConfig;
