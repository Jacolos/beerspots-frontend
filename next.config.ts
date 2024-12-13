import { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '',
  assetPrefix: '/', // zmienione z './' na '/'
  trailingSlash: true,
}

export default config