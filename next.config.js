/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig.experimental.swcPlugins = [
    [require.resolve("tempo-devtools/swc/0.90"), {}],
  ];
}

module.exports = nextConfig;
