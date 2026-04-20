"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import {
  Building2,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  MapPin,
  Zap,
  ShieldCheck,
  Phone,
  Mail,
  Navigation,
  Check,
  CheckSquare,
  Square as SquareIcon,
  CreditCard,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/app/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import PropertyScoringEngine from "./PropertyScoringEngine";
import { useAuth } from "@/context/authcontext";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import { Property } from "@/app/types/property";

interface PropertyReviewDialogProps {
  property: Property;
  onApprove: (
    property: Property,
    inspectionFee: number,
    monthlyRent: number,
    cautionFee: number,
    paybackAmount: number,
    upgradeLoan?: number,
    amortizationPeriod?: number
  ) => Promise<void>;
  onReject: (property: Property, reason?: string) => Promise<void>;
  refreshData?: () => void;
}

// Image Carousel Component
const CarouselDialog = ({
  images,
  isOpen,
  onClose,
  currentIndex,
  onIndexChange,
}: {
  images: { url: string; label: string }[];
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) => {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const nextImage = () => {
    onIndexChange((currentIndex + 1) % images.length);
  };

  const prevImage = () => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    onIndexChange(index);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[9999] transition-all duration-500 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button - Top Right */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[100] bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all hover:rotate-90 backdrop-blur-md border border-white/20 shadow-xl"
        title="Close (Esc)"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-7xl h-[85vh] flex items-center justify-center p-4">
        {/* Floating arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 z-[100] bg-white/10 hover:bg-white/20 text-white rounded-2xl p-5 transition-all hover:-translate-x-1 border border-white/10 backdrop-blur-md shadow-2xl group flex items-center justify-center"
            >
              <ChevronLeft className="h-10 w-10 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 z-[100] bg-white/10 hover:bg-white/20 text-white rounded-2xl p-5 transition-all hover:translate-x-1 border border-white/10 backdrop-blur-md shadow-2xl group flex items-center justify-center"
            >
              <ChevronRight className="h-10 w-10 group-hover:scale-110 transition-transform" />
            </button>

            {/* Invisible click areas on the image sides for easier navigation */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-50 cursor-w-resize" onClick={(e) => { e.stopPropagation(); prevImage(); }} title="Previous" />
            <div className="absolute inset-y-0 right-0 w-1/4 z-50 cursor-e-resize" onClick={(e) => { e.stopPropagation(); nextImage(); }} title="Next" />
          </>
        )}

        <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500 pointer-events-none">
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].label}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('data:image')) return;
              target.src = "/images/logo-ezpay.png";
              target.onerror = () => {
                target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
              };
            }}
          />
        </div>
      </div>

      {/* Info & Thumbnails Strip */}
      <div className="w-full bg-black/40 backdrop-blur-xl border-t border-white/10 p-6 flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className="text-white text-xl font-bold font-raleway tracking-tight">
            {images[currentIndex].label}
          </p>
          <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-medium">
            Screenshot {currentIndex + 1} of {images.length}
          </p>
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-3 overflow-x-auto pb-2 max-w-full no-scrollbar">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all overflow-hidden ${
                  index === currentIndex
                    ? "border-blue-500 scale-110 shadow-lg shadow-blue-500/20"
                    : "border-transparent opacity-40 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.label}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StreetViewComponent = ({ lat, lng }: { lat: number; lng: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initStreetView = () => {
      if (mapRef.current && (window as any).google?.maps?.StreetViewPanorama) {
        new (window as any).google.maps.StreetViewPanorama(mapRef.current, {
          position: { lat: Number(lat), lng: Number(lng) },
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
        });
      }
    };

    if (!(window as any).google) {
      const scriptId = "google-maps-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = initStreetView;
        document.head.appendChild(script);
      } else {
        const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
        const oldOnload = existingScript.onload;
        existingScript.onload = function (e) {
          if (typeof oldOnload === "function") oldOnload.call(this, e);
          initStreetView();
        };
      }
    } else {
      initStreetView();
    }
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px]" />;
};

const PropertyReviewDialog = ({
  property,
  onApprove,
  onReject,
  refreshData,
}: PropertyReviewDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    action: "" as "approve" | "reject",
  });
  const [rejectComment, setRejectComment] = useState("");
  const [inspectionFee, setInspectionFee] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [cautionFee, setCautionFee] = useState(0);
  const [paybackAmount, setPaybackAmount] = useState(0);
  const [upgradeLoan, setUpgradeLoan] = useState(0);
  const [amortizationPeriod, setAmortizationPeriod] = useState(0);
  
  // Verification checklist state
  const [verifications, setVerifications] = useState({
    details: false,
    ownership: false,
    media: false,
    terms: false,
  });

  const { token } = useAuth();

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Prefill calculations
  useEffect(() => {
    if (!property) return;

    const rent = property.rent || 0;
    const isPrime = property.landlord_package === "prime";
    const rentPremium = rent * 1.1;
    const upfrontPremium = (rentPremium * 4) / 12;

    // 1. Calculate Inspection Fee
    // Dummy office location in Sangotedo, Lekki-Epe Expressway, Lagos
    const officeLat = 6.4735;
    const officeLng = 3.6190;
    const propLat = property.latitude || Number(property.locationData?.lat) || officeLat;
    const propLng = property.longitude || Number(property.locationData?.long) || officeLng;
    
    const distance = calculateDistance(propLat, propLng, officeLat, officeLng);
    const calculatedInspectionFee = Math.ceil((10000 + distance * 500) / 1000) * 1000; // 10k base + 500/km, rounded up to nearest 1k
    setInspectionFee(calculatedInspectionFee);

    // Formula: monthly_rent = (rent + (rent/5) + 2000000) / 12, rounded up to nearest 1k
    const calculatedMonthlyRent = Math.ceil(((rent + (rent / 5) + 2000000) / 12) / 1000) * 1000;
    setMonthlyRent(calculatedMonthlyRent);
    
    // Caution Fee = Monthly Rent * 3 (already multiple of 1k if monthly is, but let's be safe)
    const calculatedCautionFee = Math.ceil((calculatedMonthlyRent * 3) / 1000) * 1000;
    setCautionFee(calculatedCautionFee);

    if (!isPrime) {
      if (paybackAmount === 0 && upgradeLoan > 0) {
        setPaybackAmount(upgradeLoan);
      }
    }
  }, [property, upgradeLoan, amortizationPeriod]);
  // Helper function to ensure full URL
  const getFullImageUrl = (url: string) => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    
    const siteBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");
    
    // If it's already a full URL
    if (url.startsWith("http")) return url;
    
    // Clean up leading slashes
    const cleanPath = url.startsWith("/") ? url.slice(1) : url;
    
    return `${siteBaseUrl}/${cleanPath}`;
  };

  // Collect all available images
  const getAllImages = (property: Property) => {
    const images: { url: string; label: string }[] = [];

    // Exterior Photo (Handle both casings)
    const exteriorShot =
      property.exteriorShot || property.exterior_shot;
    if (exteriorShot) {
      images.push({
        url: getFullImageUrl(exteriorShot),
        label: "Exterior Photo",
      });
    }

    // Compound/Road photo
    const compoundRoad =
      property.compound_road || property.compoundRoad;
    if (compoundRoad && typeof compoundRoad === "string" && compoundRoad.includes("/storage/")) {
      images.push({
        url: getFullImageUrl(compoundRoad),
        label: "Compound/Road Photo",
      });
    }

    // Power System (Check if it's an image path)
    const powerSystem = property.power_system || property.powerSystem;
    if (powerSystem && typeof powerSystem === "string" && powerSystem.includes("/storage/")) {
      images.push({
        url: getFullImageUrl(powerSystem),
        label: "Power System Photo",
      });
    }

    // Interior Rooms
    const interiorRoomsRaw =
      property.interior_rooms || property.interiorRooms;
    if (interiorRoomsRaw) {
      try {
        if (typeof interiorRoomsRaw === "string" && interiorRoomsRaw) {
          const rooms = interiorRoomsRaw.includes("[")
            ? JSON.parse(interiorRoomsRaw)
            : interiorRoomsRaw.split(",");

          if (Array.isArray(rooms)) {
            rooms.forEach((room: string, index: number) => {
              if (room && room.trim()) {
                images.push({
                  url: getFullImageUrl(room.trim()),
                  label: `Interior Room ${index + 1}`,
                });
              }
            });
          } else if (typeof rooms === "string" && rooms) {
            images.push({
              url: getFullImageUrl(rooms),
              label: "Interior Room",
            });
          }
        } else if (Array.isArray(interiorRoomsRaw)) {
          interiorRoomsRaw.forEach((room: string, index: number) => {
            if (room) {
              images.push({
                url: getFullImageUrl(room),
                label: `Interior Room ${index + 1}`,
              });
            }
          });
        }
      } catch (e) {
        console.error("Error parsing interior rooms:", e);
        if (typeof interiorRoomsRaw === "string" && interiorRoomsRaw) {
          const rooms = interiorRoomsRaw.split(",");
          rooms.forEach((room: string, index: number) => {
            if (room && room.trim()) {
              images.push({
                url: getFullImageUrl(room.trim()),
                label: `Interior Room ${index + 1}`,
              });
            }
          });
        }
      }
    }
    return images;
  };

  const openConfirmationDialog = (action: "approve" | "reject") => {
    setConfirmationDialog({
      open: true,
      action,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      open: false,
      action: "approve",
    });
  };

  const handleApproveProperty = async () => {
    setIsProcessing(true);
    try {
      if (property?.listing_status === "upgrade_pending") {
        // Special case for completing upgrade
        const response = await fetch(`${API_BASE_URL}/listings/${property.id}`, {
          method: "PATCH",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ 
            listing_status: "available" 
          }),
        });
        if (!response.ok) throw new Error("Failed to update availability");
        if (refreshData) refreshData();
      } else {
        await onApprove(
          property,
          inspectionFee,
          monthlyRent,
          cautionFee,
          paybackAmount,
          upgradeLoan,
          amortizationPeriod
        );
      }
      closeConfirmationDialog();
    } catch (error) {
      console.error("Error approving property:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProperty = async () => {
    await onReject(property, rejectComment); 
    closeConfirmationDialog();
  };

  // No longer fetching from database as per user request


  return (
    <>
      <div className="space-y-6">
        {/* Property Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Property Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Property Address</Label>
                <div className="flex items-start mt-1">
                  <MapPin className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {property.property_address}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-gray-600">
                  {property.city_location || property.locationData?.city || ""}{" "}
                  {property.area ? `(${property.area})` : ""},{" "}
                  {property.state}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-gray-600">
                  {property.typology}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Number of Units</Label>
                <p className="text-sm text-gray-600">
                  {property.number_of_units || property.no_of_units}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Power System</Label>
                <div className="flex items-center mt-1">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  <p className="text-sm text-gray-600">
                    {property.power_system && property.power_system.includes("/storage/") 
                      ? "Available (See Photos)" 
                      : property.power_system || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Compound/Road</Label>
                <div className="flex items-center mt-1">
                  <Building2 className="h-4 w-4 mr-2 text-blue-400" />
                  <p className="text-sm text-gray-600">
                    {property.compound_road && property.compound_road.includes("/storage/") 
                      ? "Available (See Photos)" 
                      : property.compound_road || "N/A"}
                  </p>
                </div>
              </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Annual Rent</Label>
                <p className="text-sm text-gray-900 font-bold">
                  ₦{property.rent?.toLocaleString() || "N/A"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Calculated Monthly:</Label>
                  <span className="text-sm font-semibold text-green-600">
                    ₦{property.rent 
                      ? Math.round(property.rent / 12).toLocaleString() 
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Landlord Package</Label>
                <div className="mt-1">
                  <Badge
                    className={
                      property.landlord_package === "prime"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }
                  >
                    {property.landlord_package === "prime"
                      ? "EZ-PRIME"
                      : "EZ-VANTAGE"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Status</Label>
                <Badge
                  variant={
                    property.status === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {property.status || "Pending"}
                </Badge>
              </div>
              {property.listing_status && (
                <div className="flex items-center space-x-2">
                   <Label className="text-sm font-medium">Listing Status</Label>
                   <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 capitalize">
                     {property.listing_status.replace("_", " ")}
                   </Badge>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <p className="text-sm text-gray-600">
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Location Map / Street View */}
          {(property.latitude || property.locationData?.lat) && (
            <div className="mt-6">
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Navigation className="h-4 w-4 mr-1 text-blue-500" />
                Location Visualization (Street View/Map)
              </Label>
              <Tabs defaultValue="map" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="map">Map View</TabsTrigger>
                  <TabsTrigger value="street">Street View</TabsTrigger>
                </TabsList>
                <TabsContent value="map">
                  <div className="w-full h-[300px] rounded-lg overflow-hidden border bg-gray-100 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${property.latitude || property?.locationData?.lat},${property?.locationData?.long || property.longitude}&layer=c&cbll=${property.latitude || property?.locationData?.lat},${property.longitude || property?.locationData?.long}&z=18&output=embed`}
                    ></iframe>
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${property.latitude || property?.locationData?.lat},${property.longitude || property?.locationData?.long}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white px-3 py-1 text-xs font-medium rounded shadow hover:bg-gray-50 flex items-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Open in Maps
                      </a>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="street">
                  <div className="w-full h-[300px] rounded-lg overflow-hidden border bg-gray-100">
                    <StreetViewComponent 
                      lat={Number(property.latitude) || Number(property?.locationData?.lat)} 
                      lng={Number(property.longitude) || Number(property?.locationData?.long)} 
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Owner Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-indigo-500" />
            Owner Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {property.landlord?.full_name || property.full_name}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {property.landlord?.email || property.email}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <div className="flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {property.landlord?.phone || property.phone}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Designation</Label>
                <p className="text-sm text-gray-600">
                  {property.designation || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Occupation</Label>
                <p className="text-sm text-gray-600">
                  {property.occupation || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Place of Work</Label>
                <p className="text-sm text-gray-600">
                  {property.place_of_work || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Nationality</Label>
                <p className="text-sm text-gray-600">
                  {property.nationality || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">State of Origin</Label>
                <p className="text-sm text-gray-600">
                  {property.state_of_origin || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">LGA of Origin</Label>
                <p className="text-sm text-gray-600">
                  {property.lga_of_origin || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Residential Address</Label>
                <p className="text-sm text-gray-600">
                  {property.residential_address || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        {property.business_name && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Business Name</Label>
                <p className="text-sm text-gray-600">
                  {property.business_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Business Address</Label>
                <p className="text-sm text-gray-600">
                  {property.business_address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents & Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents & Media
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Property Images Carousel */}
            {(() => {
              const images = getAllImages(property);
              if (images.length === 0) return null;

              const displayImages = images.slice(0, 5);
              const remainingCount = images.length - 5;

              return (
                <div className="col-span-full space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-blue-500" />
                      Property Media Gallery
                    </Label>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-medium">
                      {images.length} {images.length === 1 ? 'Photo' : 'Photos'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 h-[400px] md:h-[500px]">
                    {/* Main Featured Image */}
                    <div 
                      className="md:col-span-2 lg:col-span-3 h-full relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-blue-500 transition-all shadow-md active:scale-[0.98]"
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setIsCarouselOpen(true);
                      }}
                    >
                      <img
                        src={images[0].url}
                        alt={images[0].label}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <p className="text-white text-sm font-semibold">{images[0].label}</p>
                        <p className="text-white/70 text-xs">Featured View</p>
                      </div>
                      <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                        <Eye className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Side Grid */}
                    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-3 h-full">
                      {images.slice(1, 5).map((image, idx) => {
                        const actualIndex = idx + 1;
                        const isLast = idx === 3 && remainingCount > 0;
                        
                        return (
                          <div
                            key={actualIndex}
                            className="relative cursor-pointer group overflow-hidden rounded-xl border-2 border-transparent hover:border-blue-500 transition-all shadow-sm h-full active:scale-[0.98]"
                            onClick={() => {
                              setCurrentImageIndex(actualIndex);
                              setIsCarouselOpen(true);
                            }}
                          >
                            <img
                              src={image.url}
                              alt={image.label}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            
                            {isLast ? (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white border-2 border-white/20 rounded-xl group-hover:bg-black/50 transition-all">
                                <span className="text-2xl font-bold">+{remainingCount}</span>
                                <span className="text-[10px] uppercase tracking-widest font-bold">More</span>
                              </div>
                            ) : (
                              <>
                                <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all truncate text-white text-[10px] font-medium">
                                  {image.label}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 scale-75 group-hover:scale-100 transition-transform">
                                    <Eye className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Fill empty cells in the 2x2 grid if fewer than 5 images */}
                      {images.length > 1 && images.length < 5 && Array.from({ length: 5 - images.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300">
                          <Building2 className="h-8 w-8 opacity-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {property.c_of_o && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  Certificate of Occupancy (C of O)
                </Label>
                <a
                  href={getFullImageUrl(property.c_of_o)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  View Document
                </a>
              </div>
            )}
            {property.ownershipDoc && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  Ownership Document
                </Label>
                <a
                  href={getFullImageUrl(property.ownershipDoc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Document
                </a>
              </div>
            )}
            {property.govId && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  Government ID
                </Label>
                <a
                  href={getFullImageUrl(property.govId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View ID
                </a>
              </div>
            )}
            {property.cacCert && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  CAC Certificate
                </Label>
                <a
                  href={getFullImageUrl(property.cacCert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Certificate
                </a>
              </div>
            )}
          </div>

          {/* Image Carousel Modal */}
          <CarouselDialog
            isOpen={isCarouselOpen}
            onClose={() => setIsCarouselOpen(false)}
            images={getAllImages(property)}
            currentIndex={currentImageIndex}
            onIndexChange={setCurrentImageIndex}
          />
        </div>

         {/* Verification Checklists (For Prime) */}
         {property.landlord_package === "prime" && (
           <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
             <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-900">
               <ShieldCheck className="h-5 w-5 mr-2" />
               Compliance & Standard Verification
             </h3>
             <p className="text-xs text-purple-700 mb-6 font-medium">
               As an EZ-PRIME property, the following sections must be manually verified and attested to meet our standard before approval.
             </p>
             <div className="space-y-4">
               {[
                 { id: "details", label: "Property Details & Location Verified" },
                 { id: "ownership", label: "Ownership & Personal Information Authenticated" },
                 { id: "media", label: "Documents & Media Quality Meets Standard" },
                 { id: "terms", label: "Pricing & Final Terms Confirmed" },
               ].map((item) => (
                 <div 
                   key={item.id} 
                   className="flex items-center space-x-3 cursor-pointer group"
                   onClick={() => setVerifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                 >
                   <div className={`p-1 rounded-md transition-colors ${verifications[item.id as keyof typeof verifications] ? "bg-purple-600 text-white" : "bg-white text-purple-300 border border-purple-200 shadow-sm group-hover:border-purple-400"}`}>
                     {verifications[item.id as keyof typeof verifications] ? <CheckSquare className="h-5 w-5" /> : <SquareIcon className="h-5 w-5" />}
                   </div>
                   <span className={`text-sm font-medium ${verifications[item.id as keyof typeof verifications] ? "text-purple-900" : "text-purple-700"}`}>
                     {item.label}
                   </span>
                 </div>
               ))}
             </div>
           </div>
         )}

        <div className="flex justify-end gap-4 pt-4 border-t">
          {property.status === "approved" || ["available", "rented", "maintenance", "upgrade_pending"].includes(property.listing_status || "") ? (
            <>
              {property.listing_status === "upgrade_pending" ? (
                <Button
                  onClick={() => openConfirmationDialog("approve")}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Upgrade & List
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      /* TODO: Implement edit functionality */
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      /* TODO: Implement deactivate functionality */
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={() => openConfirmationDialog("reject")}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Submission
              </Button>
              <Button
                onClick={() => openConfirmationDialog("approve")}
                className="bg-green-600 hover:bg-green-700"
                disabled={
                  isProcessing || 
                  (property.landlord_package === "prime" && 
                   (!verifications.details || !verifications.ownership || !verifications.media || !verifications.terms))
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {property.landlord_package === "prime" 
                  ? "Approve & List Property" 
                  : "Approve for Upgrade"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Approve/Reject */}
      <AlertDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => {
          if (!open) closeConfirmationDialog();
        }}
      >
        <AlertDialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.action === "approve"
                ? "Approve Property Submission"
                : "Reject Property Submission"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-4">
                {confirmationDialog.action === "approve" ? (
                  <div className="space-y-4">
                    <p className="text-sm">
                      {property.listing_status === "upgrade_pending"
                        ? "Confirm that the upgrade is complete. This will make the listing available to the public."
                        : "Set the final pricing and package details for this listing."}
                    </p>
                    
                    {property.listing_status !== "upgrade_pending" && (
                      <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                           <Label htmlFor="inspection-fee" className="text-xs font-bold uppercase text-slate-500">Inspection Fee (₦) *</Label>
                           <input
                             id="inspection-fee"
                             type="number"
                             className="w-full p-2 border rounded-md"
                             value={inspectionFee || ""}
                             onChange={(e) => setInspectionFee(Number(e.target.value))}
                             placeholder="0"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="monthly-rent" className="text-xs font-bold uppercase text-slate-500">Monthly Rent (₦) *</Label>
                           <input
                             id="monthly-rent"
                             type="number"
                             className="w-full p-2 border rounded-md"
                             value={monthlyRent || ""}
                             onChange={(e) => setMonthlyRent(Number(e.target.value))}
                             placeholder="0"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="caution-fee" className="text-xs font-bold uppercase text-slate-500">Caution Fee (₦) *</Label>
                           <input
                             id="caution-fee"
                             type="number"
                             className="w-full p-2 border rounded-md"
                             value={cautionFee || ""}
                             onChange={(e) => setCautionFee(Number(e.target.value))}
                             placeholder="0"
                           />
                        </div>

                        {property.landlord_package !== "prime" && (
                          <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-100">
                               <CreditCard className="h-4 w-4 text-blue-600" />
                               <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Loan & Upgrade Financing</h4>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label htmlFor="upgrade-loan" className="text-xs font-bold uppercase text-slate-500">Upgrade Loan (₦)</Label>
                                  <input
                                    id="upgrade-loan"
                                    type="number"
                                    className="w-full p-2 border border-blue-200 rounded-md bg-white"
                                    placeholder="Amount"
                                    value={upgradeLoan || ""}
                                    onChange={(e) => setUpgradeLoan(Number(e.target.value))}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <Label htmlFor="amortization" className="text-xs font-bold uppercase text-slate-500">Period (Months)</Label>
                                  <input
                                    id="amortization"
                                    type="number"
                                    className="w-full p-2 border border-blue-200 rounded-md bg-white"
                                    placeholder="e.g. 12"
                                    value={amortizationPeriod || ""}
                                    onChange={(e) => setAmortizationPeriod(Number(e.target.value))}
                                  />
                               </div>
                             </div>
                            <div className="grid grid-cols-2 gap-4"><div className="space-y-2">
                               <Label htmlFor="payback-amount" className="text-xs font-bold uppercase text-slate-500">Total Payback Amount (₦) *</Label>
                               <input
                                 id="payback-amount"
                                 type="number"
                                 className="w-full p-2 border border-blue-200 rounded-md bg-white"
                                 value={paybackAmount || ""}
                                 onChange={(e) => setPaybackAmount(Number(e.target.value))}
                                 placeholder="0"
                               />
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="amortization-rate" className="text-xs font-bold uppercase text-slate-500">Monthly Amortization Rate (₦) *</Label>
                               <input
                                 id="amortization-rate"
                                 type="number"
                                 className="w-full p-2 border border-blue-200 rounded-md bg-white-200"
                                 value={Math.round(paybackAmount/amortizationPeriod)|| 0}                                 
                                 placeholder="0"
                                 disabled
                               />
                             </div>
                             </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={property.listing_status === "upgrade_pending" ? "bg-blue-50 p-4 rounded-lg" : "bg-green-50 p-4 rounded-lg"}>
                      <p className={`text-sm font-medium ${property.listing_status === "upgrade_pending" ? "text-blue-800" : "text-green-800"}`}>
                         {property.listing_status === "upgrade_pending" ? "Completing upgrade will:" : "Approval will:"}
                      </p>
                      <ul className={`text-sm mt-2 list-disc pl-4 space-y-1 ${property.listing_status === "upgrade_pending" ? "text-blue-700" : "text-green-700"}`}>
                        <li>{property.listing_status === "upgrade_pending" ? "Move listing status to 'Available'" : "Activate the listing with designated pricing"}</li>
                        <li>Make it visible to potential tenants on the platform</li>
                        {property.landlord_package !== "prime" && property.listing_status !== "upgrade_pending" && (
                          <li className="font-bold">Initial status will be 'Pending Upgrade'</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm">
                      Are you sure you want to reject this property submission? Please provide a reason below.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="reject-comment" className="text-xs font-bold uppercase text-slate-500">Reason for Rejection *</Label>
                      <textarea
                        id="reject-comment"
                        className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Explain why this submission is being rejected..."
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                      />
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-800">This will:</p>
                      <ul className="text-sm text-red-700 mt-2 list-disc pl-4 space-y-1">
                        <li>Notify the property owner of the rejection</li>
                        <li>Allow the owner to make corrections and resubmit</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Property Detail Summary</span>
                    <Badge variant="outline" className="bg-white capitalize">{property.landlord_package}</Badge>
                  </div>
                  <p className="font-semibold text-gray-900">{property.property_address}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-600">
                    <span>{property.typology}</span>
                    <span>•</span>
                    <span>{property.area}, {property.state}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmationDialog.action === "approve"
                  ? handleApproveProperty
                  : handleRejectProperty
              }
              disabled={
                isProcessing || 
                (confirmationDialog.action === "reject" && !rejectComment) ||
                (confirmationDialog.action === "approve" && property.listing_status !== "upgrade_pending" && !inspectionFee)
              }
              className={
                confirmationDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : confirmationDialog.action === "approve" ? (
                property.listing_status === "upgrade_pending" ? "Complete & List" : "Approve Submission"
              ) : (
                "Confirm Rejection"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PropertyReviewDialog;
