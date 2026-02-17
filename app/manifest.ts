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
        src: '/images/EZPAY-15.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
