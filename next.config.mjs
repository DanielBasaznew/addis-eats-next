/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
