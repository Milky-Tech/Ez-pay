// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Header from '@/components/header';
// import ChatWidget from '@/components/chat-widget';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { MapPin, Bed, Home, Zap } from 'lucide-react';
// import { supabase, type Property } from '@/lib/supabase';

// export default function ListingsPage() {
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterState, setFilterState] = useState('all');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProperties();
//   }, []);

//   useEffect(() => {
//     filterProperties();
//   }, [searchTerm, filterState, properties]);

//   const fetchProperties = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('properties')
//         .select('*')
//         .eq('availability_status', 'available')
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setProperties(data || []);
//     } catch (error) {
//       console.error('Error fetching properties:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterProperties = () => {
//     let filtered = properties;

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (p) =>
//           p.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           p.typology.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (p.code_name && p.code_name.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }

//     if (filterState !== 'all') {
//       filtered = filtered.filter((p) => p.state === filterState);
//     }

//     setFilteredProperties(filtered);
//   };

//   const formatPrice = (price: number | null) => {
//     if (!price) return 'Contact for Price';
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0,
//     }).format(price);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <ChatWidget />

//       <div className="pt-24 pb-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h1 className="text-5xl font-bold text-primary mb-4 font-raleway">
//               Premium Properties Available
//             </h1>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Discover verified high-end homes with guaranteed power and monthly payment options
//             </p>
//           </div>

//           <Card className="mb-8">
//             <CardContent className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="md:col-span-2">
//                   <Input
//                     placeholder="Search by location, property type, or code..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="font-montserrat"
//                   />
//                 </div>
//                 <Select value={filterState} onValueChange={setFilterState}>
//                   <SelectTrigger className="font-montserrat">
//                     <SelectValue placeholder="Filter by State" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All States</SelectItem>
//                     <SelectItem value="Lagos">Lagos</SelectItem>
//                     <SelectItem value="Abuja">Abuja</SelectItem>
//                     <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </CardContent>
//           </Card>

//           {loading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//               <p className="mt-4 text-gray-600">Loading properties...</p>
//             </div>
//           ) : filteredProperties.length === 0 ? (
//             <Card>
//               <CardContent className="p-12 text-center">
//                 <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
//                 <p className="text-gray-600">Try adjusting your search or filters</p>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredProperties.map((property) => (
//                 <Card key={property.id} className="overflow-hidden border-2 border-accent/20 hover:border-accent hover:shadow-2xl transition-all duration-300">
//                   <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
//                     {property.lead_image_url ? (
//                       <img
//                         src={property.lead_image_url}
//                         alt={property.typology}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <Home className="h-16 w-16 text-gray-400" />
//                       </div>
//                     )}
//                     <Badge className="absolute top-2 right-2 bg-secondary text-white font-montserrat">
//                       Available Now
//                     </Badge>
//                   </div>
//                   <CardContent className="p-6">
//                     {property.code_name && (
//                       <p className="text-sm text-gray-500 mb-2 font-montserrat">{property.code_name}</p>
//                     )}
//                     <h3 className="text-xl font-bold text-primary mb-2 font-raleway">
//                       {property.typology}
//                     </h3>
//                     <div className="flex items-center text-gray-600 mb-4">
//                       <MapPin className="h-4 w-4 mr-1" />
//                       <span className="text-sm">{property.area}, {property.state}</span>
//                     </div>
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center text-secondary">
//                         <Zap className="h-5 w-5 mr-1" />
//                         <span className="text-sm font-semibold">15+ hrs power</span>
//                       </div>
//                       {property.number_of_units > 1 && (
//                         <div className="flex items-center text-gray-600">
//                           <Bed className="h-4 w-4 mr-1" />
//                           <span className="text-sm">{property.number_of_units} units</span>
//                         </div>
//                       )}
//                     </div>
//                     <div className="border-t pt-4">
//                       <p className="text-2xl font-bold text-primary mb-4 font-raleway">
//                         {formatPrice(property.monthly_cost)}<span className="text-sm text-gray-600">/month</span>
//                       </p>
//                       <Link href={`/listings/${property.code_name || property.id}`}>
//                         <Button className="w-full bg-primary hover:bg-primary/90 font-montserrat">
//                           View Property Details
//                         </Button>
//                       </Link>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/header";
import ChatWidget from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Bed, Home, Zap, Bath, Square } from "lucide-react";
import { type Property } from "@/lib/supabase";

// Demo data
const DEMO_PROPERTIES: Property[] = [
  {
    id: "1",
    created_at: "2024-01-15T10:30:00Z",
    code_name: "PREMIUM-001",
    property_address: "24A Banana Island",
    area: "Ikoyi",
    state: "Lagos",
    typology: "4-Bedroom Luxury Villa",
    property_type: "house",
    number_of_units: 1,
    bedrooms: 4,
    bathrooms: 5,
    square_feet: 4500,
    lead_image_url:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    monthly_cost: 8500000,
    annual_cost: 102000000,
    availability_status: "available",
    power_supply: true,
    amenities: ["Swimming Pool", "Gym", "Security", "Parking"],
    description: "Luxury villa with panoramic views",
  },
  {
    id: "2",
    created_at: "2024-01-14T14:20:00Z",
    code_name: "PREMIUM-002",
    property_address: "15A Bishop Oluwole Street",
    area: "Victoria Island",
    state: "Lagos",
    typology: "3-Bedroom Penthouse",
    property_type: "apartment",
    number_of_units: 2,
    bedrooms: 3,
    bathrooms: 3,
    square_feet: 2800,
    lead_image_url:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    monthly_cost: 5200000,
    annual_cost: 62400000,
    availability_status: "available",
    power_supply: true,
    amenities: ["Concierge", "Rooftop Terrace", "Smart Home"],
    description: "Modern penthouse in prime location",
  },
  {
    id: "3",
    created_at: "2024-01-13T09:15:00Z",
    code_name: "PREMIUM-003",
    property_address: "42 Maitama Avenue",
    area: "Maitama",
    state: "Abuja",
    typology: "5-Bedroom Duplex",
    property_type: "house",
    number_of_units: 1,
    bedrooms: 5,
    bathrooms: 6,
    square_feet: 5200,
    lead_image_url:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    monthly_cost: 9500000,
    annual_cost: 114000000,
    availability_status: "available",
    power_supply: true,
    amenities: ["Garden", "Pool", "Security Quarters"],
    description: "Spacious duplex with premium finishes",
  },
  {
    id: "4",
    created_at: "2024-01-12T11:45:00Z",
    code_name: "PREMIUM-004",
    property_address: "8A GRA Phase 2",
    area: "Port Harcourt",
    state: "Port Harcourt",
    typology: "4-Bedroom Detached House",
    property_type: "house",
    number_of_units: 3,
    bedrooms: 4,
    bathrooms: 4,
    square_feet: 3800,
    lead_image_url:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    monthly_cost: 6800000,
    annual_cost: 81600000,
    availability_status: "available",
    power_supply: true,
    amenities: ["Borehole", "Generator", "CCTV"],
    description: "Secure family home with ample space",
  },
  {
    id: "5",
    created_at: "2024-01-11T16:10:00Z",
    code_name: "PREMIUM-005",
    property_address: "32 Lekki Phase 1",
    area: "Lekki",
    state: "Lagos",
    typology: "3-Bedroom Apartment",
    property_type: "apartment",
    number_of_units: 4,
    bedrooms: 3,
    bathrooms: 3,
    square_feet: 2200,
    lead_image_url:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    monthly_cost: 4200000,
    annual_cost: 50400000,
    availability_status: "available",
    power_supply: true,
    amenities: ["Pool", "Gym", "24/7 Security"],
    description: "Modern apartment in gated community",
  },
  {
    id: "6",
    created_at: "2024-01-10T13:25:00Z",
    code_name: "PREMIUM-006",
    property_address: "15 Asokoro District",
    area: "Asokoro",
    state: "Abuja",
    typology: "6-Bedroom Mansion",
    property_type: "house",
    number_of_units: 1,
    bedrooms: 6,
    bathrooms: 7,
    square_feet: 6500,
    lead_image_url:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    monthly_cost: 12500000,
    annual_cost: 150000000,
    availability_status: "available",
    power_supply: true,
    amenities: ["Helipad", "Cinema", "Wine Cellar", "Staff Quarters"],
    description: "Ultra-luxury mansion with premium amenities",
  },
];

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      setProperties(DEMO_PROPERTIES);
      setFilteredProperties(DEMO_PROPERTIES);
      setLoading(false);
    }, 800); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, filterState, properties]);

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.typology.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.code_name &&
            p.code_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterState !== "all") {
      filtered = filtered.filter((p) => p.state === filterState);
    }

    setFilteredProperties(filtered);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-4 font-raleway">
              Premium Properties Available
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover verified high-end homes with guaranteed power and monthly
              payment options
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search by location, property type, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-montserrat"
                  />
                </div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="font-montserrat">
                    <SelectValue placeholder="Filter by State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden border-2 border-accent/20 hover:border-accent hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {property.lead_image_url ? (
                      <img
                        src={property.lead_image_url}
                        alt={property.typology}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <Home className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-secondary text-white font-montserrat">
                      Available Now
                    </Badge>
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      {property.power_supply && (
                        <Badge
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm"
                        >
                          <Zap className="h-3 w-3 mr-1" /> Power
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {property.code_name && (
                      <p className="text-sm text-gray-500 mb-2 font-montserrat">
                        {property.code_name}
                      </p>
                    )}
                    <h3 className="text-xl font-bold text-primary mb-2 font-raleway line-clamp-1">
                      {property.typology}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {property.area}, {property.state}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-gray-600">
                          <Bed className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.bedrooms} beds
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Bath className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.bathrooms} baths
                          </span>
                        </div>
                        {property.square_feet && (
                          <div className="flex items-center text-gray-600">
                            <Square className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {property.square_feet.toLocaleString()} sqft
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {property.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {amenity}
                              </Badge>
                            ))}
                          {property.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <p className="text-2xl font-bold text-primary mb-4 font-raleway">
                        {formatPrice(property.monthly_cost)}
                        <span className="text-sm text-gray-600">/month</span>
                      </p>
                      <Link
                        href={`/listings/${property.code_name || property.id}`}
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90 font-montserrat">
                          View Property Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredProperties.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Showing {filteredProperties.length} of {properties.length}{" "}
                properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
