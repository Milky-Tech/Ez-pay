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
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Clock,
  Home,
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
import { Card, CardContent } from "@/app/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/app/components/ui/avatar";
import PropertyScoringEngine from "./PropertyScoringEngine";
import { useAuth } from "@/context/authcontext";
import { 
  TrendingUp, 
  Globe, 
  Info, 
  AlertCircle, 
  FileCheck,
  ShieldAlert,
  Wallet,
  ArrowRight,
  Sparkles,
  Brain,
} from "lucide-react";

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
  offices?: any[];
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
  offices,
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
    // Find relevant office based on state or fallback to dummy
    const relevantOffice = offices?.find(o => {
      const searchString = `${o.name} ${o.address} ${o.state || ""}`.toLowerCase();
      const propState = (property.state || "").toLowerCase();
      return searchString.includes(propState);
    }) || offices?.[0];

    const officeLat = relevantOffice?.latitude || 6.4735;
    const officeLng = relevantOffice?.longitude || 3.6190;
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

    // Power System (Check if it's image paths)
    const powerSystemRaw = property.power_system || property.powerSystem;
    if (powerSystemRaw) {
      try {
        if (typeof powerSystemRaw === "string" && powerSystemRaw.includes("/storage/")) {
          // Could be JSON array or comma separated
          const powerImages = powerSystemRaw.includes("[") 
            ? JSON.parse(powerSystemRaw) 
            : powerSystemRaw.split(",");
            
          if (Array.isArray(powerImages)) {
            powerImages.forEach((img: string, idx: number) => {
              if (img && img.trim()) {
                images.push({
                  url: getFullImageUrl(img.trim()),
                  label: `Power System Photo ${idx + 1}`,
                });
              }
            });
          } else {
            images.push({
              url: getFullImageUrl(powerSystemRaw),
              label: "Power System Photo",
            });
          }
        }
      } catch (e) {
        // Fallback for simple string
        if (typeof powerSystemRaw === "string" && powerSystemRaw.includes("/storage/")) {
          images.push({
            url: getFullImageUrl(powerSystemRaw),
            label: "Power System Photo",
          });
        }
      }
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
      <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={
                property.landlord_package === "prime"
                  ? "bg-purple-600 text-white border-none text-[10px] font-black uppercase tracking-widest px-3"
                  : "bg-blue-600 text-white border-none text-[10px] font-black uppercase tracking-widest px-3"
              }>
                {property.landlord_package === "prime" ? "EZ-PRIME ASSET" : "EZ-VANTAGE ASSET"}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-slate-200 text-slate-500">
                {property.typology}
              </Badge>
            </div>
            <h2 className="text-3xl font-black text-slate-900 font-raleway tracking-tight leading-tight">
              {property.property_address}
            </h2>
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#9A2A2A]" />
                {property.city_location || property.locationData?.city || property.area}, {property.state}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Submitted {property.created_at ? new Date(property.created_at).toLocaleDateString() : "Recently"}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
             <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-black text-xs uppercase tracking-widest ${
               property.status === "approved" 
                 ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                 : "bg-amber-50 text-amber-700 border-amber-100"
             }`}>
               <div className={`w-2 h-2 rounded-full ${property.status === "approved" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
               {property.status || "Pending Review"}
             </div>
             {property.listing_status && (
               <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
                 {property.listing_status.replace("_", " ").toUpperCase()}
               </Badge>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details & Media */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* AI Intelligence Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 font-raleway flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Property Intelligence
                </h3>
                <Badge className="bg-purple-50 text-purple-700 border-purple-100 font-black text-[10px] uppercase tracking-widest px-3">
                  Powered by EZ-AI
                </Badge>
              </div>
              
              <div className="p-1 rounded-[2rem] bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 border border-purple-100/20 shadow-inner">
                <PropertyScoringEngine propertyData={property as any} />
              </div>
            </section>

            {/* Property Media Gallery */}
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 font-raleway flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#9A2A2A]" />
                  Asset Visualization
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {getAllImages(property).length} Professional Captures
                </span>
              </div>

              {(() => {
                const images = getAllImages(property);
                if (images.length === 0) {
                  return (
                    <div className="h-[300px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Eye className="h-10 w-10 opacity-20" />
                      <p className="font-bold text-sm uppercase tracking-widest">No Media Available</p>
                    </div>
                  );
                }

                const displayImages = images.slice(0, 5);
                const remainingCount = images.length - 5;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 h-[400px] md:h-[500px]">
                    {/* Main Featured Image */}
                    <div 
                      className="md:col-span-2 lg:col-span-3 h-full relative group cursor-pointer overflow-hidden rounded-[2rem] border-2 border-transparent hover:border-[#9A2A2A] transition-all shadow-xl active:scale-[0.98]"
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setIsCarouselOpen(true);
                      }}
                    >
                      <img
                        src={images[0].url}
                        alt={images[0].label}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                        <p className="text-white text-sm font-bold uppercase tracking-wider">{images[0].label}</p>
                        <p className="text-white/70 text-[10px] font-medium">Click to expand gallery</p>
                      </div>
                    </div>

                    {/* Side Grid */}
                    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4 h-full">
                      {images.slice(1, 5).map((image, idx) => {
                        const actualIndex = idx + 1;
                        const isLast = idx === 3 && remainingCount > 0;
                        
                        return (
                          <div
                            key={actualIndex}
                            className="relative cursor-pointer group overflow-hidden rounded-2xl border-2 border-transparent hover:border-[#9A2A2A] transition-all shadow-md h-full active:scale-[0.98]"
                            onClick={() => {
                              setCurrentImageIndex(actualIndex);
                              setIsCarouselOpen(true);
                            }}
                          >
                            <img
                              src={image.url}
                              alt={image.label}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            
                            {isLast ? (
                              <div className="absolute inset-0 bg-[#9A2A2A]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white border-2 border-white/20 rounded-2xl group-hover:bg-[#9A2A2A]/90 transition-all">
                                <span className="text-3xl font-black font-raleway">+{remainingCount}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black">View All</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 scale-75 group-hover:scale-100 transition-transform">
                                  <Eye className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* Comprehensive Property Details */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 font-raleway flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#9A2A2A]" />
                Architectural Specifications
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Typology", value: property.typology, icon: Home },
                  { label: "Units Available", value: property.number_of_units || property.no_of_units, icon: Building2 },
                  { label: "State", value: property.state, icon: MapPin },
                  { label: "Area", value: property.area, icon: Navigation },
                  { label: "Annual Revenue", value: `₦${property.rent?.toLocaleString()}`, icon: Wallet },
                  { 
                    label: "Power System", 
                    value: (property.power_system || property.powerSystem)?.includes("/storage/") 
                      ? "Visual Record Attached" 
                      : (property.power_system || property.powerSystem || "Standard"), 
                    icon: Zap 
                  },
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <item.icon className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="font-bold text-slate-900">{item.value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Geographic Verification */}
            {(property.latitude || property.locationData?.lat) && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 font-raleway flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Geographic Reconnaissance
                  </h3>
                </div>
                
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-950">
                  <CardContent className="p-0">
                    <Tabs defaultValue="map" className="w-full">
                      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
                        <TabsList className="bg-white/5 border-none p-1 rounded-xl">
                          <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-[#9A2A2A] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest px-6">Satellite Map</TabsTrigger>
                          <TabsTrigger value="street" className="rounded-lg data-[state=active]:bg-[#9A2A2A] data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest px-6">Street Intelligence</TabsTrigger>
                        </TabsList>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${property.latitude || property?.locationData?.lat},${property.longitude || property?.locationData?.long}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                          Real-time view <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                      
                      <TabsContent value="map" className="mt-0 ring-0 focus-visible:ring-0">
                        <div className="w-full h-[400px] relative">
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=${property.latitude || property?.locationData?.lat},${property?.locationData?.long || property.longitude}&z=18&output=embed`}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="street" className="mt-0 ring-0 focus-visible:ring-0">
                        <div className="w-full h-[400px] bg-slate-900">
                          <StreetViewComponent 
                            lat={Number(property.latitude) || Number(property?.locationData?.lat)} 
                            lng={Number(property.longitude) || Number(property?.locationData?.long)} 
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>

          {/* Right Column: Owner, Financials & Compliance */}
          <div className="space-y-10">
            
            {/* Owner/Landlord Profile Card */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 font-raleway flex items-center gap-2">
                <User className="h-5 w-5 text-[#C9A227]" />
                Owner Portfolio
              </h3>
              
              <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="h-24 w-24 text-[#C9A227]" />
                </div>
                <CardContent className="p-8 space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-lg">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-[#C9A227] to-[#9A2A2A] text-white text-xl font-black">
                        {(property.landlord?.full_name || property.full_name)?.charAt(0) || "L"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 font-raleway leading-none">
                        {property.landlord?.full_name || property.full_name}
                      </h4>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase">
                        Verified Identity
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {[
                      { icon: Mail, value: property.landlord?.email || property.email },
                      { icon: Phone, value: property.landlord?.phone || property.phone },
                      { icon: Briefcase, value: property.occupation || "Independent Proprietor" },
                      { icon: Globe, value: property.nationality || "Nigerian" },
                    ].map((info, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-600">
                        <info.icon className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-xs font-medium truncate">{info.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Residential Intelligence</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {property.residential_address || "Address not provided in submission."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Financial Analysis Summary */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 font-raleway flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Yield Projections
              </h3>

              <div className="space-y-4">
                <Card className="border-none shadow-lg bg-emerald-600 text-white rounded-3xl overflow-hidden relative group shadow-emerald-100">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <TrendingUp className="h-16 w-16" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Annual Yield</p>
                    <h5 className="text-3xl font-black font-raleway">₦{property.rent?.toLocaleString()}</h5>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-white/40 text-[8px] font-black uppercase">Monthly Gross</p>
                        <p className="text-sm font-bold">₦{property.rent ? Math.round(property.rent / 12).toLocaleString() : "0"}</p>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="text-right space-y-0.5">
                        <p className="text-white/40 text-[8px] font-black uppercase">Service Charge</p>
                        <p className="text-sm font-bold text-white/60">₦0.00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {property.landlord_package === "vantage" && (
                   <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <Zap className="h-20 w-20 text-amber-400" />
                    </div>
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Upgrade Financing</p>
                        <div className="flex items-baseline gap-2">
                          <h5 className="text-3xl font-black font-raleway text-amber-400 tracking-tight">
                            ₦{(property.upgrade_loan || 0).toLocaleString()}
                          </h5>
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Principal Issued</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="space-y-1">
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Amortization</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-amber-400" />
                            <p className="text-sm font-black">{property.amortization_period || 24} Months</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Repayment Schedule</p>
                          <p className="text-xs font-bold text-white/60">Monthly Cycle</p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 group-hover:bg-white/10 transition-colors">
                        <p className="text-amber-400/60 text-[9px] font-black uppercase tracking-widest mb-1">Total Payback (Principal + Interest)</p>
                        <p className="text-xl font-black text-white tracking-tight">₦{(property.payback_amount || 0).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Vantage Agreement</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Legal Documents */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 font-raleway flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-indigo-600" />
                Legal Documents
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "c_of_o", label: "C of O", icon: ShieldCheck, value: property.c_of_o },
                  { id: "ownership", label: "Title Deed", icon: FileText, value: property.ownershipDoc },
                  { id: "gov_id", label: "Govt ID", icon: User, value: property.govId },
                ].filter(d => d.value).map((doc:any, i:any) => (
                  <a
                    key={i}
                    href={getFullImageUrl(doc.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <doc.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{doc.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
                {!property.c_of_o && !property.ownershipDoc && !property.govId && (
                   <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Documents Attached</p>
                   </div>
                )}
              </div>
            </section>

             {/* Verification Checklist */}
            {property.landlord_package === "prime" && (
              <section className="space-y-6 pt-4">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-10">
                    <ShieldCheck className="h-40 w-40 text-emerald-500" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white font-raleway flex items-center gap-2">
                        Institutional Compliance
                      </h3>
                      <p className="text-slate-400 text-xs font-medium">
                        EZ-PRIME properties undergo rigorous manual validation before activation.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { id: "details", label: "Geographic Location & Specs" },
                        { id: "ownership", label: "Identity & Title Authenticated" },
                        { id: "media", label: "Media Assets Standardized" },
                        { id: "terms", label: "Financial Terms Finalized" },
                      ].map((item) => (
                        <button 
                          key={item.id} 
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                            verifications[item.id as keyof typeof verifications] 
                              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                          onClick={() => setVerifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded-lg transition-all ${
                              verifications[item.id as keyof typeof verifications] ? "bg-emerald-500 text-slate-900" : "bg-white/10 text-white/40 group-hover:text-white"
                            }`}>
                              {verifications[item.id as keyof typeof verifications] ? <Check className="h-4 w-4" /> : <SquareIcon className="h-4 w-4" />}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">{item.label}</span>
                          </div>
                          {verifications[item.id as keyof typeof verifications] && (
                            <Badge className="bg-emerald-500 text-slate-900 text-[8px] font-black border-none h-5">VERIFIED</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="sticky bottom-0 z-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-6 -mx-8 -mb-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
               <ShieldAlert className="h-6 w-6 text-slate-300" />
             </div>
             <div>
               <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Review Integrity</p>
               <p className="text-[10px] text-slate-400 font-medium">All actions are logged and auditable within the EZ-PAY ecosystem.</p>
             </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {property.status === "approved" || ["available", "rented", "maintenance", "upgrade_pending"].includes(property.listing_status || "") ? (
              <>
                {property.listing_status === "upgrade_pending" ? (
                  <Button
                    onClick={() => openConfirmationDialog("approve")}
                    className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 active:translate-y-0"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Finalize Upgrade & Launch
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="h-12 px-6 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Listing
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-12 px-6 bg-red-50 text-red-600 border-none hover:bg-red-600 hover:text-white font-bold rounded-2xl transition-all shadow-none"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Take Offline
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => openConfirmationDialog("reject")}
                  disabled={isProcessing}
                  className="h-14 px-8 border-red-200 text-red-600 hover:bg-red-50 font-black uppercase tracking-[0.15em] text-xs rounded-2xl transition-all"
                >
                  <XCircle className="h-5 w-5 mr-3" />
                  Decline Asset
                </Button>
                <Button
                  onClick={() => openConfirmationDialog("approve")}
                  className={`h-14 px-10 font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 ${
                    isProcessing || (property.landlord_package === "prime" && (!verifications.details || !verifications.ownership || !verifications.media || !verifications.terms))
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-[#9A2A2A] hover:bg-[#7a2222] text-white shadow-red-200"
                  }`}
                  disabled={
                    isProcessing || 
                    (property.landlord_package === "prime" && 
                     (!verifications.details || !verifications.ownership || !verifications.media || !verifications.terms))
                  }
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      {property.landlord_package === "prime" ? "Authorize & Publish" : "Authorize Upgrade"}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
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
                                  <Label htmlFor="upgrade-loan" className="text-xs font-bold uppercase text-slate-500">Loan Issued (₦)</Label>
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
                                  <Label htmlFor="amortization" className="text-xs font-bold uppercase text-slate-500">Amortization Period (Months)</Label>
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
                               <Label htmlFor="payback-amount" className="text-xs font-bold uppercase text-slate-500">Total Payback (Principal + Interest) (₦) *</Label>
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
                                 value={amortizationPeriod > 0 ? Math.round(paybackAmount / amortizationPeriod) : 0}                                 
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
