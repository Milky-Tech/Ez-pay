"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import ChatWidget from "@/components/ui/chat-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Zap,
  Shield,
  Droplet,
  CheckCircle,
  Calendar,
  Video,
  Home,
  Users,
  Car,
  Wifi,
} from "lucide-react";
import { type Property } from "@/lib/types";

// Demo data (same as in listings page)
const DEMO_PROPERTIES: Property[] = [
  {
    id: "1",
    landlord_id: "info@bridgent.co",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
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
    desired_annual_rent: 102000000,
    availability_status: "available",
    onboarding_stage: "completed",
    partnership_tier: "ez_prime",
    power_supply: true,
    amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Garden", "Tennis Court"],
    description: "Luxury villa with panoramic views of the lagoon. Features modern architecture with premium finishes throughout.",
  },
  {
    id: "2",
    landlord_id: "info@bridgent.co",
    created_at: "2024-01-14T14:20:00Z",
    updated_at: "2024-01-14T14:20:00Z",
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
    desired_annual_rent: 62400000,
    availability_status: "available",
    onboarding_stage: "completed",
    partnership_tier: "ez_prime",
    power_supply: true,
    amenities: ["Concierge", "Rooftop Terrace", "Smart Home", "Pool", "Gym"],
    description: "Modern penthouse in prime location with stunning city views and smart home automation.",
  },
  {
    id: "3",
    landlord_id: "info@bridgent.co",
    created_at: "2024-01-13T09:15:00Z",
    updated_at: "2024-01-13T09:15:00Z",
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
    desired_annual_rent: 114000000,
    availability_status: "available",
    onboarding_stage: "completed",
    partnership_tier: "ez_prime",
    power_supply: true,
    amenities: ["Garden", "Pool", "Security Quarters", "Home Theater", "Wine Cellar"],
    description: "Spacious duplex with premium finishes, ideal for large families or entertaining.",
  },
  {
    id: "4",
    landlord_id: "info@bridgent.co",
    created_at: "2024-01-12T11:45:00Z",
    updated_at: "2024-01-12T11:45:00Z",
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
    desired_annual_rent: 81600000,
    availability_status: "available",
    onboarding_stage: "completed",
    partnership_tier: "ez_prime",
    power_supply: true,
    amenities: ["Borehole", "Generator", "CCTV", "Garden", "Parking"],
    description: "Secure family home with ample space, perfect for comfortable living in a quiet neighborhood.",
  },
  {
    id: "5",
    landlord_id: "info@bridgent.co",
    created_at: "2024-01-11T16:10:00Z",
    updated_at: "2024-01-11T16:10:00Z",
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
    desired_annual_rent: 50400000,
    availability_status: "available",
    onboarding_stage: "completed",
    partnership_tier: "ez_prime",
    power_supply: true,
    amenities: ["Pool", "Gym", "24/7 Security", "Playground", "Barbecue Area"],
    description: "Modern apartment in gated community with excellent amenities and family-friendly environment.",
  },
  {
    id: "6",
    landlord_id: "info@bridgent.co",
    created_at: "2024-01-10T13:25:00Z",
    updated_at: "2024-01-10T13:25:00Z",
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
    desired_annual_rent: 150000000,
    availability_status: "available",
    onboarding_stage: "completed",
    partnership_tier: "ez_prime",
    power_supply: true,
    amenities: ["Helipad", "Cinema", "Wine Cellar", "Staff Quarters", "Pool", "Tennis Court", "Garden"],
    description: "Ultra-luxury mansion with premium amenities, perfect for luxury living and entertainment.",
  },
];

export default function PropertyDetailsPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectionType, setInspectionType] = useState<"physical" | "virtual">(
    "physical"
  );
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionEmail, setInspectionEmail] = useState("");
  const [inspectionPhone, setInspectionPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch property
    const timer = setTimeout(() => {
      const codename = params.codename as string;
      const foundProperty = DEMO_PROPERTIES.find(
        (p) => p.code_name === codename || p.id === codename
      );
      setProperty(foundProperty || null);
      setLoading(false);
    }, 600); // Simulate network delay

    return () => clearTimeout(timer);
  }, [params.codename]);

  const handleInspectionBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inspection Booked",
      description: `${
        inspectionType === "physical" ? "Physical" : "Virtual"
      } inspection booked successfully for ${inspectionDate}! Confirmation email sent to ${inspectionEmail}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Property Not Found
            </h2>
            <Link href="/listings">
              <Button>Back to Listings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact for Price";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate price breakdown
  const monthlyCost = property.monthly_cost || 0;
  const annualCost = property.desired_annual_rent || monthlyCost * 12;
  const securityDeposit = monthlyCost * 2; // Typically 2 months deposit
  const agencyFee = monthlyCost * 0.1; // Typically 10% agency fee

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/listings"
              className="text-primary hover:underline font-montserrat flex items-center"
            >
              <span className="mr-2">&larr;</span> Back to Listings
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6 overflow-hidden">
                <div className="relative h-[500px] bg-gradient-to-br from-gray-200 to-gray-300">
                  {property.lead_image_url ? (
                    <img
                      src={property.lead_image_url}
                      alt={property.typology}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                  <Badge className="absolute top-4 right-4 bg-secondary text-white font-montserrat text-lg px-4 py-2">
                    Available Now
                  </Badge>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-sm text-gray-800">
                      <Zap className="h-4 w-4 mr-1" /> Guaranteed Power
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card>
                <CardContent className="p-8">
                  {property.code_name && (
                    <p className="text-sm text-gray-500 mb-2 font-montserrat">
                      {property.code_name}
                    </p>
                  )}
                  <h1 className="text-4xl font-bold text-primary mb-4 font-raleway">
                    {property.typology}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-lg">
                      {property.property_address}, {property.area},{" "}
                      {property.state}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <Bed className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">
                        {property.bedrooms}
                      </p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <Bath className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">
                        {property.bathrooms}
                      </p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <Square className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">
                        {property.square_feet?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Square Feet</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">
                        {property.number_of_units}
                      </p>
                      <p className="text-sm text-gray-600">Units</p>
                    </div>
                  </div>

                  <div className="border-t border-b py-6 mb-6">
                    <h2 className="text-2xl font-semibold text-primary mb-4 font-raleway">
                      Property Features
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <Bed className="h-5 w-5 text-secondary mr-2" />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-5 w-5 text-secondary mr-2" />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-5 w-5 text-secondary mr-2" />
                        <span>
                          {property.square_feet?.toLocaleString()} sqft
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-secondary mr-2" />
                        <span>Parking Space</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 text-secondary mr-2" />
                        <span>Guaranteed Power</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-secondary mr-2" />
                        <span>24/7 Security</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-primary mb-4 font-raleway">
                      Amenities & Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {property.amenities?.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Guaranteed 15+ hours of power daily</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Dedicated Facility Manager</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Water Treatment System</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>24/7 Gated Security</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/10 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-2 font-raleway">
                      Property Description
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {property.description ||
                        `This premium ${property.typology.toLowerCase()} is part of our verified collection that meets the ACCESSS Standard. Every aspect has been carefully evaluated to ensure you experience House Serenity. With guaranteed power, professional management, and premium amenities, this property offers unmatched comfort and reliability.`}
                    </p>
                    <p className="text-gray-700">
                      Located in the prestigious {property.area} area of{" "}
                      {property.state}, this property offers the perfect blend
                      of luxury, comfort, and convenience. Ideal for families,
                      professionals, or investors looking for premium real
                      estate.
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 font-raleway">
                      Price Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="font-semibold">
                          {formatPrice(monthlyCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Rent:</span>
                        <span className="font-semibold">
                          {formatPrice(annualCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Security Deposit (3 months):
                        </span>
                        <span className="font-semibold">
                          {formatPrice(securityDeposit)}
                        </span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">Agency Fee (10%):</span>
                        <span className="font-semibold">
                          {formatPrice(agencyFee)}
                        </span>
                      </div> */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold text-primary">
                          <span>Initial Payment:</span>
                          <span>
                            {formatPrice(
                              monthlyCost + securityDeposit + agencyFee
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      Monthly EZ-Pay Rate
                    </p>
                    <p className="text-4xl font-bold text-primary font-raleway">
                      {formatPrice(property.monthly_cost)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">per month</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Annual Cost: {formatPrice(annualCost)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex flex-col gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-primary hover:bg-primary/90 font-montserrat text-lg py-6">
                          <Calendar className="mr-2 h-5 w-5" />
                          Book Inspection
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-raleway">
                            Book an Inspection
                          </DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleInspectionBooking}
                          className="space-y-4"
                        >
                          <div>
                            <Label className="mb-3 block">
                              Inspection Type
                            </Label>
                            <RadioGroup
                              value={inspectionType}
                              onValueChange={(value: any) =>
                                setInspectionType(value)
                              }
                            >
                              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem
                                  value="physical"
                                  id="physical"
                                />
                                <Label
                                  htmlFor="physical"
                                  className="flex-1 cursor-pointer"
                                >
                                  <div>
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-2" />
                                      <p className="font-semibold">
                                        Physical Inspection
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      In-person visit (₦50,000 - refundable upon
                                      signing)
                                    </p>
                                  </div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer mt-2">
                                <RadioGroupItem value="virtual" id="virtual" />
                                <Label
                                  htmlFor="virtual"
                                  className="flex-1 cursor-pointer"
                                >
                                  <div>
                                    <div className="flex items-center">
                                      <Video className="h-4 w-4 mr-2" />
                                      <p className="font-semibold">
                                        Virtual Inspection
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Live video tour (Free)
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div>
                            <Label htmlFor="date">Preferred Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={inspectionDate}
                              onChange={(e) =>
                                setInspectionDate(e.target.value)
                              }
                              required
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={inspectionEmail}
                              onChange={(e) =>
                                setInspectionEmail(e.target.value)
                              }
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="phone"
                              value={inspectionPhone}
                              onChange={(e) =>
                                setInspectionPhone(e.target.value)
                              }
                              placeholder="+234"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-primary font-montserrat"
                          >
                            Confirm Booking
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Link href={`/apply/${property.code_name || property.id}`}>
                      <Button className="w-full bg-secondary hover:bg-secondary/90 font-montserrat text-lg py-6">
                        Start Application
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center text-secondary">
                      <Zap className="h-5 w-5 mr-2" />
                      <span className="font-semibold">
                        15+ hours guaranteed power daily
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Shield className="h-5 w-5 mr-2" />
                      <span>24/7 Security & Professional Management</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Droplet className="h-5 w-5 mr-2" />
                      <span>Borehole & Water Treatment System</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Wifi className="h-5 w-5 mr-2" />
                      <span>High-speed Internet Ready</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Need Help?
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Our team is available to answer any questions about this
                      property.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full font-montserrat"
                    >
                      Contact Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
