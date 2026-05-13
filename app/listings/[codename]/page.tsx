import PropertyDetailsClient from "./PropertyDetailsClient";
import { type Property } from "@/lib/types";
import { Metadata } from "next";

type Props = {
  params: { codename: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const codename = params.codename;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${codename}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) return { title: "Property Not Found" };
    
    const { data: property } = await res.json() as { data: Property };
    
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
  } catch (error) {
    return { title: "Property Listing | Ez-pay" };
  }
}

export default async function PropertyDetailsPage({ params }: Props) {
  const codename = params.codename;
  
  // Fetch initial data on server
  let initialProperty: Property | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${codename}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const { data } = await res.json();
      initialProperty = data;
    }
  } catch (error) {
    console.error("Error fetching property on server:", error);
  }

  return <PropertyDetailsClient initialProperty={initialProperty} codename={codename} />;
}
