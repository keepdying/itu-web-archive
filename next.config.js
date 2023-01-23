// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const path = require('path')

const nextConfig = {
  basePath: '/itu-web-archive',
  images: {
    unoptimized: true
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  }
}

module.exports = nextConfig
