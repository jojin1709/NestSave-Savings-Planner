/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/downlod',
        destination: '/download',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;