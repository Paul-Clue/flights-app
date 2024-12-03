/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    NEXT_PUBLIC_RAPIDAPI_KEY: process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
  },
}

module.exports = nextConfig 