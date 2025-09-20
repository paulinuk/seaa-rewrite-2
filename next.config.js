/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep builds moving even if ESLint finds issues (optional)
  eslint: { ignoreDuringBuilds: true },

  // If you don't use Image Optimization, this avoids remote loader setup
  images: { unoptimized: true },

  // ✅ Next 15 replacement for experimental.serverComponentsExternalPackages
  serverExternalPackages: ['@supabase/supabase-js'],
};

module.exports = nextConfig;
