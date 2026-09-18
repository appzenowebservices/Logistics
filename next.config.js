/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Small-VPS guard: cap Next build/static-gen workers so
  // `Collecting page data using 23 workers` doesn't EAGAIN.
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
