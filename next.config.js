/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Don't fail builds on type errors during development
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
    },
    eslint: {
        // Don't fail builds on lint errors during development
        ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    },
    images: {
        domains: ['firebasestorage.googleapis.com'],
    },
}

module.exports = nextConfig;