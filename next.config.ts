import type { NextConfig } from 'next';

/**
 * The site is a fully static export so it can sit on GitHub Pages, Vercel,
 * Netlify or any dumb file host.
 *
 * BASE_PATH is empty for a root deploy (custom domain, Vercel) and "/askAsher"
 * for a GitHub project page. The Pages workflow sets it; everything in the app
 * reads it back through `lib/paths.ts`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
