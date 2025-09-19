/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
  output: 'standalone',
}

module.exports = nextConfig