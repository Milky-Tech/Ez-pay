import { MetadataRoute } from 'next'
import { type Property } from '@/lib/types'

const BASE_URL = 'https://ezpay.bridgenthomes.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base routes
  const routes = ['', '/listings', '/signin', '/signup'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Fetch all property codenames
  try {
    const res = await fetch(`${API_URL}/listings`, {
      next: { revalidate: 3600 }
    })
    
    if (res.ok) {
      const { data: properties } = await res.json() as { data: Property[] }
      
      const listingRoutes = properties.map((property) => ({
        url: `${BASE_URL}/listings/${property.code_name || property.id}`,
        lastModified: new Date(property.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      
      return [...routes, ...listingRoutes]
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return routes
}
