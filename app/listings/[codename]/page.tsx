import PropertyDetailsClient from "./PropertyDetailsClient";
import { type Property } from "@/lib/types";
import { Metadata } from "next";
import { cache } from 'react';

type Props = {
  params: { codename: string };
};

// Deduped and cached fetch
const getProperty = cache(async (codename: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${codename}`, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });
    
    if (!res.ok) return null;
    const { data } = await res.json() as { data: Property };
    return data;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(params.codename);
  
  if (!property) return { title: "Property Not Found | Ez-pay" };

  const title = `${property.typology} in ${property.area}, ${property.state} | Ez-pay`;
  const description = `Rent this beautiful ${property.bedrooms} bedroom ${property.typology} in ${property.area}. ${property.property_address}. Secure your monthly living now.`;
  
  const imageUrl = property.exterior_shot?.startsWith('http') 
    ? property.exterior_shot 
    : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${property.exterior_shot}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const property = await getProperty(params.codename);

  return <PropertyDetailsClient initialProperty={property} codename={params.codename} />;
}
