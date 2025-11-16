/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'api.parqet.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'api.elbstream.com',
        port: '',
        pathname: '**'
      }
    ]
  }
}
