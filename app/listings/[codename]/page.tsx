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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/app/components/ui/carousel";
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
  CheckCircle,
  Calendar,
  Video,
  Home,
  Users,
  Car,
  Copy,
  Loader2,
  Mail,
  Phone,
  FileText,
  Edit,
  Wifi,
  Lock,
  Droplets,
  ArrowRight,
} from "lucide-react";
import { type Property } from "@/lib/types";
import { useAuth } from "@/context/authcontext";
import Footer from "@/app/components/footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";
const BASEURL_SITE = "https://ezpay.bridgenthomes.com";

const INSPECTION_POLICY = `
EZPAY INSPECTION REFUND & CANCELLATION POLICY

1. Transaction Flow & Processing Time
EZPAY utilizes Paystack for secure payment processing.
Settlement: Funds paid for inspections are typically settled into the EZPAY corporate account within 24 hours (T+1).
Refund Disbursement: Upon a valid and approved refund request, EZPAY will process the disbursement within 48 hours of the request date.

2. Refund Eligibility & Tiered Service Fees
Inspection fees coordinate logistics and manage property access. Cancellations incur:
A. Standard Cancellation (Prior to Inspection Day): 30% service charge. (Request made within 24 hours of payment AND at least 24 hours before scheduled date)
B. Same-Day Cancellation (Prior to 4-Hour Window): 50% service charge. (Request made on the day, but >4 hours before)
C. Late-Notice Cancellation (Within 4 Hours/No-Show): 80% service charge.

3. Request Process
All refund requests must be submitted via the EZPAY Platform or sent to support@ezpay.bridgent.com.
`;

export default function PropertyDetailsPage() {
  const params = useParams();
  const codename = params.codename as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  
  const [inspectionType, setInspectionType] = useState<"physical" | "virtual">(
    "physical"
  );
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionEmail, setInspectionEmail] = useState("");
  const [inspectionPhone, setInspectionPhone] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<Record<
    string,
    any
  > | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const { toast } = useToast();

  const { user, token } = useAuth();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/listings/${codename}`);
        if (!response.ok) throw new Error("Listing not found");
        const data = await response.json();
        const propertyData = data.data || data;
        setProperty(propertyData);
        
        // Fetch related properties in the same area
        if (propertyData?.area) {
          const allListingsResponse = await fetch(`${API_BASE_URL}/listings`);
          if (allListingsResponse.ok) {
            const allListingsData = await allListingsResponse.json();
            const allListings = allListingsData.data || allListingsData;
            
            // Filter by same area, exclude current property, take first 3
            const related = allListings
              .filter((p: Property) => 
                p.area === propertyData.area && 
                p.id !== propertyData.id
              )
              .slice(0, 3);
            
            setRelatedProperties(related);
          }
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    if (codename) {
      fetchProperty();
    }
  }, [codename]);

  // Check for payment verification on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference) {
      // Verify payment
      const verifyPayment = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/inspections/verify-payment/${reference}`);
          const data = await response.json();
          
          if (response.ok && data.booking) {
            // Payment verified - show success
            setBookingDetails({
              booking_id: data.booking.payment_reference || reference,
              inspection_type: data.booking.inspection_type,
              preferred_date: data.booking.preferred_date,
              email: data.booking.email,
              property_name: property?.typology || "Property",
            });
            setShowConfirmation(true);
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            toast({
              title: "✅ Payment Confirmed!",
              description: "Your inspection booking has been confirmed. We'll reach out to you soon.",
              duration: 5000,
            });
          } else {
            toast({
              title: "Payment Verification Failed",
              description: data.message || "Unable to verify your payment. Please contact support.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          toast({
            title: "Verification Error",
            description: "Unable to verify payment. Please contact support if you were charged.",
            variant: "destructive",
          });
        }
      };
      
      verifyPayment();
    }
  }, [property]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Consolidate all images into a single array
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

  // Auto-rotate images every 1 minute
  useEffect(() => {
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [allImages.length]);

  const getFullImageUrl = (url: string | undefined) => {
    if (!url) return "";
    const cleanUrl = url.trim();
    return cleanUrl.startsWith("http")
      ? cleanUrl
      : `https://ez-pay.realestway.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Required fields validation
    if (!inspectionDate) errors.push("Preferred date is required");
    if (!inspectionEmail) errors.push("Email address is required");
    if (!inspectionPhone) errors.push("Phone number is required");
    if (!policyAccepted) errors.push("You must accept the refund & cancellation policy");

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
        house_listing_id: property?.id ? parseInt(property.id) : undefined,
      };

      // Call the API endpoint
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/inspections/book`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.payment_url) {
        // Physical inspection - redirect to Paystack
        window.location.href = data.payment_url;
        return;
      } else if (response.ok && data.booking) {
        // Virtual inspection (free) - show confirmation modal
        setBookingDetails({
          booking_id: data.booking.payment_reference || data.reference,
          inspection_type: data.booking.inspection_type,
          preferred_date: data.booking.preferred_date,
          email: data.booking.email,
          property_name: property?.typology,
        });
        setShowConfirmation(true);

        // Reset form
        setInspectionDate("");
        setInspectionEmail("");
        setInspectionPhone("");
        setPolicyAccepted(false);

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
            data.error || data.message || "Failed to book inspection. Please try again.",
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

  // Calculate price breakdown
  const monthlyCost = (property.rent * 1.1) / 12 / (property.no_of_units || 1);
  const annualCost = (property.rent * 1.1) / (property.no_of_units || 1);
  const securityDeposit = monthlyCost * 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />
      
      <section className="relative h-[45vh] flex pt-auto justify-center bg-[#000000] bg-transparent-[60%]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/aboutUs.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] lg:max-w-1/3 mx-auto my-auto flex pt-6">
          <div className="px-6 md:px-12 text-center m-auto">
            <h1 className="text-5xl font-bold text-white mb-2 font-raleway">
              {property.typology}<br/> <span className="text-primary text-2xl">{property.area}, {property.state}</span>
            </h1>
            </div>
        </div>
      </section>

      <div className="pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/listings"
              className="text-[#8B2323] hover:underline font-montserrat flex items-center transition-all bg-[#8B2323]/5 w-fit px-4 py-2 rounded-full font-medium"
            >
              <span className="mr-2 text-xl">&larr;</span> Back to Listings
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">

              <div className="relative mb-6">
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {allImages.length > 0 ? (
                      allImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-gray-100">
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
                        <div className="flex h-[500px] w-full items-center justify-center rounded-2xl bg-gray-100">
                          <Home className="h-24 w-24 text-gray-300" />
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                  <Badge className="absolute top-4 right-4 bg-secondary text-white font-montserrat text-sm px-3 py-1.5 shadow-lg border-none">
                    {property.availability_status?.toUpperCase() || "AVAILABLE"}
                  </Badge>
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm shadow-sm border-none hover:bg-white"
                      onClick={() => {
                        const shareUrl = `${BASEURL_SITE}/listings/${
                          property.code_name || property.id
                        }`;
                        navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: "✅ Listing URL Copied!",
                          description: "The listing URL has been copied to your clipboard",
                          duration: 3000,
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
                          className="bg-white/90 backdrop-blur-sm shadow-sm border-none hover:bg-white"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Update Listing
                        </Button>
                      </Link>
                    )}
                  </div>
                </Carousel>
              </div>

              {/* Enhanced Photo Gallery - 3 Column Grid */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-4">
                  {allImages.slice(0, 6).map((url: string, idx: number) => {
                    const isLast = idx === 5;
                    const hasMore = allImages.length > 6;
                    
                    return (
                      <div
                        key={idx}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all ${
                          currentImageIndex === idx ? "ring-4 ring-primary" : "hover:opacity-90"
                        }`}
                        onClick={() => api?.scrollTo(idx)}
                      >
                        <img
                          src={getFullImageUrl(url)}
                          className="w-full h-full object-cover"
                          alt={`Property image ${idx + 1}`}
                        />
                        {isLast && hasMore && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg font-montserrat">
                            +{allImages.length - 6} others
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24 border-none shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <p className="text-sm text-gray-400 mb-1 font-montserrat">
                      Monthly EZ-Pay Rent
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-5xl font-bold text-[#8B2323] font-montserrat">
                        {formatPrice(monthlyCost)}
                      </p>
                      <span className="text-gray-400 text-sm">/month</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 font-montserrat">
                      Annual Cost: {formatPrice(annualCost)}
                    </p>
                  </div>

                  <div className="flex gap-4 mb-10">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-[#8B2323] hover:bg-[#6b1b1b] text-white rounded-full py-6 text-base font-medium shadow-lg shadow-[#8B2323]/20">
                          Book Inspection
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md overflow-y-auto h-[96vh]">
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
                                value: string
                              ) => setInspectionType(value as "physical" | "virtual")}
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

                          <div className="space-y-4 pt-4 border-t">
                            <div className="bg-gray-50 p-3 rounded-lg border text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line text-gray-700">
                              {INSPECTION_POLICY}
                            </div>
                            <div className="flex items-start space-x-2">
                              <input
                                type="checkbox"
                                id="policy"
                                checked={policyAccepted}
                                onChange={(e) => setPolicyAccepted(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <Label htmlFor="policy" className="text-sm font-normal cursor-pointer leading-snug">
                                I have read and accept the <span className="font-bold text-primary">EZPAY Inspection Refund & Cancellation Policy</span>
                              </Label>
                            </div>
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
                            className="w-full bg-[#8B2323] hover:bg-[#6b1b1b] font-montserrat"
                            disabled={isBooking || !policyAccepted}
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
                      href={`/listings/apply/${property.code_name || property.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full border-[#8B2323] text-[#8B2323] hover:bg-[#8B2323]/5 rounded-full py-6 text-base font-medium">
                        Apply for Apartment
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#8B2323] shrink-0">
                        <Zap className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 font-montserrat">
                        15+ Hours Guaranteed Power Daily
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#8B2323] shrink-0">
                        <Lock className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 font-montserrat">
                        24/7 Security & Professional Management
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#8B2323] shrink-0">
                        <Droplets className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 font-montserrat">
                        Borehole & Water Treatment System
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#8B2323] shrink-0">
                        <Wifi className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-gray-800 font-montserrat">
                        High Speed Internet Ready
                      </p>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <h4 className="font-bold text-xl text-gray-900 mb-2 font-montserrat">
                      Need Help?
                    </h4>
                    <p className="text-sm text-gray-500 mb-6 font-montserrat">
                      Our Team is available to answer any questions about the property
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-[#8B2323] hover:bg-white hover:border-[#8B2323] rounded-full py-5 font-semibold transition-all"
                    >
                      Contact Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {property.code_name && (
                <p className="text-sm text-gray-500 mb-2 font-montserrat">
                  {property.code_name}
                </p>
              )}
              <h1 className="text-4xl font-bold text-[#8B2323] mb-4 font-raleway">
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
                <div className="rounded-lg p-4 text-center">
                  <Bed className="h-8 w-8 text-[#888888] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#888888]">
                    {property.bedrooms}
                  </p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
                <div className="rounded-lg p-4 text-center">
                  <Bath className="h-8 w-8 text-[#888888] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#888888]">
                    {property.bathrooms}
                  </p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
                <div className="rounded-lg p-4 text-center">
                  <Square className="h-8 w-8 text-[#888888] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#888888]">
                    {property.square_feet?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Square Feet</p>
                </div>
                <div className="rounded-lg p-4 text-center">
                  <Home className="h-8 w-8 text-[#888888] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#888888]">
                    {property.no_of_units}
                  </p>
                  <p className="text-sm text-gray-600">Parking</p>
                </div>
              </div>

              
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#8B2323] mb-4 font-raleway">
                  Amenities & Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Guaranteed 20+ hours of power daily</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Dedicated Facility Manager</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Water Treatment System</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>24/7 Gated Security</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Price Breakdown Section */}
                <div className="bg-[#8B2323]/5 rounded-2xl p-6 border border-[#8B2323]/10 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-[#8B2323] mb-4 font-raleway">
                    Price Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-semibold text-lg">
                        {formatPrice(monthlyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Rent:</span>
                      <span className="font-semibold text-lg">
                        {formatPrice(annualCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Security Deposit (2 months):
                      </span>
                      <span className="font-semibold text-lg">
                        {formatPrice(securityDeposit)}
                      </span>
                    </div>
                    <div className="border-t border-[#8B2323]/20 pt-4 mt-2">
                      <div className="flex justify-between text-xl font-bold text-[#8B2323]">
                        <span>Initial Payment:</span>
                        <span>
                          {formatPrice(monthlyCost + securityDeposit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm min-h-[300px] flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <MapPin className="h-5 w-5 text-[#8B2323] mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800 font-raleway">
                      Property Location
                    </h3>
                  </div>
                  <div className="flex-1 w-full bg-gray-100 relative">
                    {(() => {
                      const lat = property.locationData?.latitude || property.location_data?.latitude;
                      const lng = property.locationData?.longitude || property.location_data?.longitude;
                      const mapQuery = lat && lng 
                        ? `${lat},${lng}` 
                        : encodeURIComponent(`${property.property_address || ""}, ${property.area || ""}, ${property.state || ""}, Nigeria`);
                      
                      const googleMapsApiKey = "DEMO_KEY"; // Replace with your actual Google Maps API key when provided
                      // If you have a real key, you can use the official Embed API:
                      // const mapUrl = \`https://www.google.com/maps/embed/v1/place?key=\${googleMapsApiKey}&q=\${mapQuery}&zoom=15\`;
                      
                      // Using the free iframe fallback until a valid key is provided so it doesn't break aesthetically
                      const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

                      return (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0, minHeight: "100%", position: "absolute", top: 0, left: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={mapUrl}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                        {formatPrice(monthlyCost)}
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

      {/* Related Properties Section */}
      {relatedProperties.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-raleway">
              Properties Available In The Same Area
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProperties.map((relatedProperty) => {
                const monthlyCost = (relatedProperty.rent * 1.1) / 12 / (relatedProperty.no_of_units || 1);
                
                // Get first interior room image or fallback
                let imageUrl = "";
                try {
                  const rooms = relatedProperty.interior_rooms;
                  const roomsArray = Array.isArray(rooms)
                    ? rooms
                    : typeof rooms === "string"
                      ? JSON.parse(rooms)
                      : [];
                  imageUrl = roomsArray && roomsArray.length > 0 
                    ? `https://ez-pay.realestway.com/${roomsArray[0]}`
                    : "";
                } catch (e) {
                  imageUrl = "";
                }
                
                return (
                  <Card
                    key={relatedProperty.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-[240px] w-full overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={relatedProperty.typology}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <Home className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Badge */}
                      <span className="absolute bottom-4 left-0 rounded-r-md bg-[#8B2323] px-4 py-1.5 text-sm font-medium text-white">
                        {relatedProperty.typology}
                      </span>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6">
                      {/* Price */}
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {formatPrice(monthlyCost)}
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      </p>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {relatedProperty.typology}, {relatedProperty.area}
                      </h3>

                      {/* Location */}
                      <p className="text-sm text-gray-500 mb-4">
                        {relatedProperty.area}, {relatedProperty.state}
                      </p>

                      {/* Icons */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Bed className="h-4 w-4" />
                          <span>{relatedProperty.bedrooms} Beds</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4" />
                          <span>{relatedProperty.bathrooms} Bath</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Car className="h-4 w-4" />
                          <span>2 Parking</span>
                        </div>
                      </div>

                      {/* Button */}
                      <Link
                        href={`/listings/${relatedProperty.code_name || relatedProperty.id}`}
                        className="block"
                      >
                        <button className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#8B2323] py-3 text-[#8B2323] font-semibold transition-all hover:bg-[#8B2323] hover:text-white">
                          View Property
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
