/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Allows building static HTML/CSS/JS export for zero-latency PWA & GitHub Pages hosting!
  images: {
    unoptimized: true
  }
};

export default nextConfig;
