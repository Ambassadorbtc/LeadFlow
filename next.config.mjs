import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a different port to avoid conflicts
  devServer: {
    port: 3001
  },
  experimental: {}
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig.experimental.swcPlugins = [[require.resolve("tempo-devtools/swc/0.90"), {}]];
}

export default nextConfig;
