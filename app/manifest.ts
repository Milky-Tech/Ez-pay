import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bridgent HomeStep EZ-Pay',
    short_name: 'Ez-Pay',
    description: 'Your Path to Monthly Living. Access verified, high-end homes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/EZPAY-16.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/images/EZPAY-16.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
