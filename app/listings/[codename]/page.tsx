"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/header";
import ChatWidget from "@/app/components/ui/chat-widget";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/app/components/ui/alert-dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
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
  Copy,
  Loader2,
  Mail,
  Phone,
  FileText,
  Edit,
} from "lucide-react";
import { type Property } from "@/lib/types";
import { useAuth } from "@/context/authcontext";

// Demo data (same as in listings page)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";
const BASEURL_SITE = "https://ezpay.bridgenthomes.com";
const BASEURL = "ez-pay.realestway.com";
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
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<Record<
    string,
    any
  > | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const { isAuthenticated, user, token } = useAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const codename = params.codename as string;
        const response = await fetch(`${API_BASE_URL}/listings/${codename}`);
        if (!response.ok) throw new Error("Listing not found");
        const data = await response.json();
        setProperty(data.data || data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.codename]);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Required fields validation
    if (!inspectionDate) errors.push("Preferred date is required");
    if (!inspectionEmail) errors.push("Email address is required");
    if (!inspectionPhone) errors.push("Phone number is required");

    // Validate date
    if (inspectionDate) {
      const selectedDate = new Date(inspectionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.push("Selected date must be in the future");
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (inspectionEmail && !emailRegex.test(inspectionEmail)) {
      errors.push("Please enter a valid email address");
    }

    // Validate phone number (Nigerian format)
    const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/;
    if (inspectionPhone) {
      const cleanedPhone = inspectionPhone.startsWith("0")
        ? "+234" + inspectionPhone.substring(1)
        : inspectionPhone;

      if (!phoneRegex.test(cleanedPhone)) {
        errors.push(
          "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)"
        );
      }
    }

    return errors;
  };

  const handleInspectionBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors([]);

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      errors.forEach((error) => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }

    setIsBooking(true);

    try {
      // Create payload matching the API endpoint requirements
      const payload = {
        inspection_type: inspectionType,
        preferred_date: inspectionDate,
        email: inspectionEmail,
        phone_number: inspectionPhone,
        // Additional context for better tracking
        property_id: property?.id || params.codename,
        property_name: property?.typology,
        property_address: `${property?.property_address}, ${property?.area}, ${property?.state}`,
      };

      // Call the API endpoint
      const response = await fetch(`${API_BASE_URL}/inspections/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.data?.authorization_url) {
        // Success - redirect to Paystack
        window.location.href = data.data.authorization_url;
        return;
      } else if (response.ok) {
        // Success - show confirmation modal
        setBookingDetails({
          ...data.data,
          inspection_type: inspectionType,
          preferred_date: inspectionDate,
          email: inspectionEmail,
          property_name: property?.typology,
        });
        setShowConfirmation(true);

        // Reset form
        setInspectionDate("");
        setInspectionEmail("");
        setInspectionPhone("");

        // Show success toast
        toast({
          title: "✅ Inspection Booked!",
          description: `Booking confirmed. Check your email for details.`,
          duration: 3000,
        });
      } else {
        // API returned an error
        toast({
          title: "Booking Failed",
          description:
            data.error || "Failed to book inspection. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error booking inspection:", error);
      toast({
        title: "Network Error",
        description:
          "Failed to connect to server. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Booking ID copied to clipboard",
      duration: 2000,
    });
  };

  // Calculate price breakdown
  const monthlyCost = property ? (property.rent * 1.1) / 12 / (property.no_of_units || 1) : 0;
  const annualCost = property ? (property.rent * 1.1) / (property.no_of_units || 1) : 0;
  const securityDeposit = monthlyCost * 2;
  const agencyFee = 0; // Agency fee removed

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
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm shadow-sm"
                      onClick={() => {
                        const shareUrl = `${BASEURL_SITE}/listings/${
                          property.code_name || property.id
                        }`;
                        navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: "Link Copied!",
                          description: "Sharing link copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Share
                    </Button>
                    {user?.role === "admin" && (
                      <Link href={`/admin?tab=listings&edit=${property.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 backdrop-blur-sm shadow-sm"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Update Listing
                        </Button>
                      </Link>
                    )}
                  </div>
                  {(() => {
                    const rooms = property.interior_rooms;
                    const roomsArray = Array.isArray(rooms)
                      ? rooms
                      : typeof rooms === "string"
                      ? JSON.parse(rooms)
                      : [];

                    return roomsArray && roomsArray.length > 0 ? (
                      <img
                        src={`https://ez-pay.realestway.com/${roomsArray[0]?.toString()}`}
                        alt={property.typology}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-24 w-24 text-gray-400" />
                      </div>
                    );
                  })()}
                  <Badge className="absolute top-4 right-4 bg-secondary text-white font-montserrat text-lg px-4 py-2 shadow-lg">
                    {property.availability_status?.toUpperCase() || "AVAILABLE"}
                  </Badge>
                </div>
              </Card>

              {/* Enhanced Photo Gallery */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4 font-raleway">
                  Property Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Exterior Shot */}
                  {property.exterior_shot && (
                    <div className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all">
                      <img
                        src={((url: string) =>
                          url.startsWith("http")
                            ? url
                            : `https://ez-pay.realestway.com/${
                                url.startsWith("/") ? url.slice(1) : url
                              }`)(property.exterior_shot)}
                        className="w-full h-full object-cover"
                        alt="Exterior"
                      />
                    </div>
                  )}

                  {/* Compound Road */}
                  {property.compound_road && (
                    <div className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all">
                      <img
                        src={((url: string) =>
                          url.startsWith("http")
                            ? url
                            : `https://ez-pay.realestway.com/${
                                url.startsWith("/") ? url.slice(1) : url
                              }`)(property.compound_road)}
                        className="w-full h-full object-cover"
                        alt="Compound/Road"
                      />
                    </div>
                  )}

                  {/* Interior Rooms */}
                  {(() => {
                    const interiorRoomsRaw = property.interior_rooms;
                    if (!interiorRoomsRaw) return null;

                    const getImageUrl = (url: string | null) => {
                      if (!url) return "";
                      const cleanUrl = url.trim();
                      return cleanUrl.startsWith("http")
                        ? cleanUrl
                        : `https://ez-pay.realestway.com/${
                            cleanUrl.startsWith("/")
                              ? cleanUrl.slice(1)
                              : cleanUrl
                          }`;
                    };

                    try {
                      let rooms = [];
                      if (typeof interiorRoomsRaw === "string") {
                        if (
                          interiorRoomsRaw.startsWith("[") ||
                          interiorRoomsRaw.startsWith("{")
                        ) {
                          rooms = JSON.parse(interiorRoomsRaw);
                        } else {
                          rooms = interiorRoomsRaw.split(",");
                        }
                      } else {
                        rooms = interiorRoomsRaw;
                      }

                      return Array.isArray(rooms)
                        ? rooms.map((url: string, idx: number) => (
                            <div
                              key={idx}
                              className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                            >
                              <img
                                src={getImageUrl(url)}
                                className="w-full h-full object-cover"
                                alt={`Interior ${idx + 1}`}
                              />
                            </div>
                          ))
                        : null;
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              </div>

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
                        {property.no_of_units}
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
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Guaranteed 20+ hours of power daily</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2" />
                        <span>Dedicated Facility Manager</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2" />
                        <span>Water Treatment System</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2" />
                        <span>24/7 Gated Security</span>
                      </div>
                    </div>
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
                          Security Deposit (2 months):
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
                            {formatPrice(monthlyCost + securityDeposit)}
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
                      {formatPrice(monthlyCost)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">per month</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Annual Cost: {formatPrice(annualCost)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex flex-col gap-1">
                    {isAuthenticated ? (
                      <>
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
                                  Inspection Type *
                                </Label>
                                <RadioGroup
                                  value={inspectionType}
                                  onValueChange={(
                                    value: "physical" | "virtual"
                                  ) => setInspectionType(value)}
                                  className="space-y-2"
                                >
                                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem
                                      value="physical"
                                      id="physical"
                                      className="mt-0"
                                    />
                                    <Label
                                      htmlFor="physical"
                                      className="flex-1 cursor-pointer flex flex-col"
                                    >
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2" />
                                        <p className="font-semibold">
                                          Physical Inspection
                                        </p>
                                        <Badge className="ml-2 bg-amber-100 text-amber-800">
                                          ₦50,000
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        In-person visit (fee refundable upon
                                        signing)
                                      </p>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem
                                      value="virtual"
                                      id="virtual"
                                      className="mt-0"
                                    />
                                    <Label
                                      htmlFor="virtual"
                                      className="flex-1 cursor-pointer flex flex-col"
                                    >
                                      <div className="flex items-center">
                                        <Video className="h-4 w-4 mr-2" />
                                        <p className="font-semibold">
                                          Virtual Inspection
                                        </p>
                                        <Badge className="ml-2 bg-green-100 text-green-800">
                                          Free
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Live video tour with our agent
                                      </p>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              <div>
                                <Label htmlFor="date">Preferred Date *</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={inspectionDate}
                                  onChange={(e) =>
                                    setInspectionDate(e.target.value)
                                  }
                                  required
                                  min={new Date().toISOString().split("T")[0]}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Inspections available Monday-Friday, 9AM-5PM
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={inspectionEmail}
                                  onChange={(e) =>
                                    setInspectionEmail(e.target.value)
                                  }
                                  placeholder="your@email.com"
                                  required
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={inspectionPhone}
                                  onChange={(e) =>
                                    setInspectionPhone(e.target.value)
                                  }
                                  placeholder="08012345678"
                                  required
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Nigerian format: 08012345678 or +2348012345678
                                </p>
                              </div>

                              {formErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-red-800 mb-1">
                                    Please fix the following errors:
                                  </p>
                                  <ul className="text-sm text-red-700 list-disc pl-4">
                                    {formErrors.map((error, index) => (
                                      <li key={index}>{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <Button
                                type="submit"
                                className="w-full bg-primary font-montserrat"
                                disabled={isBooking}
                              >
                                {isBooking ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Confirm Booking"
                                )}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Link
                          href={`/apply/${property.code_name || property.id}`}
                        >
                          <Button className="w-full bg-secondary hover:bg-secondary/90 font-montserrat text-lg py-6">
                            Start Application
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/signin">
                          <Button className="w-full bg-primary hover:bg-primary/90 font-montserrat text-lg py-6 mb-2">
                            Sign in to book inspection
                          </Button>
                        </Link>
                        <Link href="/signin">
                          <Button className="w-full bg-secondary hover:bg-secondary/90 font-montserrat text-lg py-6">
                            Sign in to apply
                          </Button>
                        </Link>
                      </>
                    )}
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

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-8 w-8 text-green-500" />
              Inspection Booked Successfully! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6 pt-4">
              {bookingDetails && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Booking Reference
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-lg font-bold text-green-900">
                            {bookingDetails.booking_id}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(bookingDetails.booking_id)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {bookingDetails.inspection_type === "physical"
                          ? "Physical"
                          : "Virtual"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Date:</span>
                        </div>
                        <p className="text-lg font-semibold">
                          {new Date(
                            bookingDetails.preferred_date
                          ).toLocaleDateString("en-NG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          {bookingDetails.inspection_type === "physical" ? (
                            <>
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Fee:</span>
                            </>
                          ) : (
                            <>
                              <Video className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Fee:</span>
                            </>
                          )}
                        </div>
                        <p className="text-lg font-semibold">
                          {bookingDetails.inspection_type === "physical"
                            ? "₦50,000"
                            : "Free"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Next Steps & Important Information
                    </h4>
                    <div className="space-y-3">
                      <p className="text-sm text-blue-700">
                        {bookingDetails.inspection_type === "physical"
                          ? "📞 Our agent will contact you within 24 hours to confirm the inspection time and provide location details."
                          : "📧 A Zoom/Google Meet link will be sent to your email 1 hour before the scheduled tour time."}
                      </p>

                      <div className="flex items-start gap-3 text-sm text-blue-700">
                        <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Confirmation Email</p>
                          <p>
                            Sent to <strong>{bookingDetails.email}</strong>.
                            Please check your inbox and spam folder.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-blue-700">
                        <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Contact Information</p>
                          <p>
                            For inquiries, call +234 700 123 4567 or email
                            support@bridgent.co
                          </p>
                        </div>
                      </div>

                      {bookingDetails.inspection_type === "physical" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> ₦50,000 inspection fee will
                            be fully refunded if you proceed to sign the lease
                            agreement within 30 days.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Property Details
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>Property:</strong> {property.typology}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Location:</strong> {property.property_address},{" "}
                        {property.area}, {property.state}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Monthly Rent:</strong>{" "}
                        {formatPrice(property.monthly_cost)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                copyToClipboard(bookingDetails?.booking_id || "");
                setShowConfirmation(false);
              }}
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Booking ID
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
