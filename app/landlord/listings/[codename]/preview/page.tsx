"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/app/components/ui/carousel";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Zap,
  Shield,
  CheckCircle,
  Calendar,
  Video,
  Home,
  Users,
  Car,
  Loader2,
  Lock,
  Droplets,
  Wifi,
  Eye,
  AlertCircle
} from "lucide-react";
import { type Property } from "@/lib/types";
import { useAuth } from "@/context/authcontext";
import Footer from "@/app/components/footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PropertyPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const codename = params.codename as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // We use the normal listing endpoint, or could use a specific one if needed
        const response = await fetch(`${API_BASE_URL}/listings/${codename}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error("Listing not found");
        const data = await response.json();
        const propertyData = data.data || data;
        
        // Security check: Only owner or admin can preview non-approved listings
        if (propertyData.status !== "approved" && user?.role !== "admin" && propertyData.landlord_id !== user?.id) {
            // If they aren't the owner or admin, and it's not approved, they shouldn't see it here
            // router.push("/landlord");
            // return;
        }

        setProperty(propertyData);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    if (codename && user) {
      fetchProperty();
    } else if (!user && !loading) {
        setLoading(false);
    }
  }, [codename, user, token]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const getAllImages = () => {
    if (!property) return [];
    
    const images: string[] = [];
    if (property.exterior_shot) images.push(property.exterior_shot);
    if (property.compound_road) images.push(property.compound_road);
    
    const interiorRoomsRaw = property.interior_rooms;
    if (interiorRoomsRaw) {
      try {
        let rooms: string[] = [];
        if (typeof interiorRoomsRaw === "string") {
            if (interiorRoomsRaw.startsWith("[") || interiorRoomsRaw.startsWith("{")) {
                const parsed = JSON.parse(interiorRoomsRaw);
                rooms = Array.isArray(parsed) ? parsed : [parsed];
            } else {
                rooms = interiorRoomsRaw.split(",").map(s => s.trim());
            }
        } else if (Array.isArray(interiorRoomsRaw)) {
          rooms = interiorRoomsRaw;
        }
        images.push(...rooms);
      } catch (e) {
        console.error("Error parsing interior rooms:", e);
      }
    }
    
    return images.filter(Boolean);
  };

  const allImages = getAllImages();

  const getFullImageUrl = (url: string | undefined) => {
    if (!url) return "";
    const cleanUrl = url.trim();
    const siteBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");
    return url.startsWith("http")
      ? url
      : `${siteBaseUrl}/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact for Price";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B2323]" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Preview Not Available
            </h2>
            <p className="text-gray-500 mb-6">We couldn't find the listing you're looking for.</p>
            <Link href="/landlord">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const monthlyCost = property.monthly_rent_anchor || (property.rent * 1.1 / 12);
  const annualCost = property.desired_annual_rent || (property.rent * 1.1);
  const securityDeposit = monthlyCost * 3;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Preview Banner */}
      <div className="bg-amber-600 text-white py-3 px-4 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Eye className="h-5 w-5" />
                <span className="font-bold font-raleway tracking-wide">PREVIEW MODE: {property.status?.toUpperCase() || "PENDING"}</span>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-xs hidden md:block opacity-90">This listing is not visible to the public yet.</p>
                <Link href="/landlord">
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white h-8">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
      </div>

      <section className="relative h-[35vh] flex pt-auto justify-center bg-[#000000]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/aboutUs.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] mx-auto my-auto flex pt-6 text-center">
            <div className="px-6 md:px-12 m-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-raleway">
                {property.typology}<br/> 
                <span className="text-primary text-xl md:text-2xl">{property.area}, {property.state}</span>
                </h1>
            </div>
        </div>
      </section>

      <div className="pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <div className="relative mb-6">
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {allImages.length > 0 ? (
                      allImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
                             <img
                                src={getFullImageUrl(image)}
                                alt={`${property.typology} - ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="flex h-[400px] md:h-[500px] w-full items-center justify-center rounded-2xl bg-gray-100">
                          <Home className="h-24 w-24 text-gray-300" />
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                  <Badge className="absolute top-4 right-4 bg-[#8B2323] text-white font-montserrat text-sm px-3 py-1.5 shadow-lg border-none">
                    PREVIEW
                  </Badge>
                </Carousel>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                {allImages.slice(0, 8).map((url, idx) => (
                    <div 
                        key={idx} 
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentImageIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        onClick={() => api?.scrollTo(idx)}
                    >
                        <img src={getFullImageUrl(url)} className="w-full h-full object-cover" alt="Gallery" />
                    </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                <h2 className="text-2xl font-bold text-[#8B2323] mb-6 font-raleway">Property Description</h2>
                <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                    <span className="text-lg">
                    {property.property_address}, {property.area}, {property.state}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-100 mb-8">
                    <div className="text-center">
                        <Bed className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xl font-bold">{property.bedrooms}</p>
                        <p className="text-xs text-gray-500 uppercase">Bedrooms</p>
                    </div>
                    <div className="text-center">
                        <Bath className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xl font-bold">{property.bathrooms}</p>
                        <p className="text-xs text-gray-500 uppercase">Bathrooms</p>
                    </div>
                    <div className="text-center">
                        <Square className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xl font-bold">{property.square_feet || 0}</p>
                        <p className="text-xs text-gray-500 uppercase">Sq Ft</p>
                    </div>
                    <div className="text-center">
                        <Home className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xl font-bold">{property.no_of_units || 1}</p>
                        <p className="text-xs text-gray-500 uppercase">Units</p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-raleway">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Guaranteed 20+ hours of power daily",
                    "Dedicated Facility Manager",
                    "Water Treatment System",
                    "24/7 Gated Security",
                    "High Speed Internet Ready",
                    "Professional Management"
                  ].map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-raleway">Financial Preview</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">EZPAY ANCHOR</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-bold text-[#8B2323] font-montserrat">
                            {formatPrice(property.monthly_rent_anchor || monthlyCost)}
                            </p>
                            <span className="text-gray-400 text-xs">/month</span>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">EZPAY ASCEND</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-bold text-[#8B2323] font-montserrat">
                            {formatPrice(monthlyCost * 0.8)}
                            </p>
                            <span className="text-gray-400 text-xs">/month</span>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Desired Annual Rent</span>
                        <span className="font-semibold text-gray-900">{formatPrice(annualCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Security Deposit</span>
                        <span className="font-semibold text-gray-900">{formatPrice(securityDeposit)}</span>
                    </div>
                  </div>

                  <div className="mt-10 space-y-3">
                    <Button disabled className="w-full bg-gray-200 text-gray-400 rounded-full py-6 cursor-not-allowed">
                        Bookings Disabled in Preview
                    </Button>
                    <p className="text-[10px] text-center text-gray-400 italic">
                        This is a preview of how prospective tenants will see your listing once approved.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-gray-900 mb-4 font-montserrat flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Verification Status
                </h4>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${property.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <div>
                        <p className="text-sm font-bold text-slate-900">Listing {property.status?.toUpperCase() || "PENDING"}</p>
                        <p className="text-xs text-slate-500">
                            {property.status === 'approved' 
                                ? "This listing is live and visible to tenants." 
                                : "Awaiting admin review and verification."}
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
