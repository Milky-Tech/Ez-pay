import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/landlord/'],
    },
    sitemap: 'https://ezpay.bridgenthomes.com/sitemap.xml',
  }
}
