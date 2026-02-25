"use client";

import { useState, useEffect } from "react";
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
import PropertyScoringEngine from "./PropertyScoringEngine";
import { useAuth } from "@/context/authcontext";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

// Interface definitions
interface Property {
  id: string;
  code_name: string;
  typology: string;
  email: string;
  phone: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  availability_status: string;
  status?: string;
  full_name: string;
  property_address?: string;
  no_of_units?: number;
  rent: number;
  compound_road?: string;
  interior_rooms?: string;
  exterior_shot?: string;
  created_at: string;
  updated_at?: string;
}

interface PropertyReviewDialogProps {
  property: Property;
  onApprove: () => void;
  onReject: () => void;
  refreshData?: () => void;
}

// Image Carousel Component
const ImageCarousel = ({
  images,
  isOpen,
  onClose,
}: {
  images: { url: string; label: string }[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-full p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Main image */}
        <div className="relative">
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].label}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.png"; // Fallback image
            }}
          />

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Image label */}
        <div className="text-center mt-4">
          <p className="text-white text-lg font-medium">
            {images[currentIndex].label}
          </p>
          <p className="text-gray-300 text-sm">
            {currentIndex + 1} of {images.length}
          </p>
        </div>

        {/* Thumbnail indicators */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                  index === currentIndex
                    ? "border-white"
                    : "border-gray-500 hover:border-gray-300"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.png";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyReviewDialog = ({
  property,
  onApprove,
  onReject,
  refreshData,
}: PropertyReviewDialogProps) => {
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    action: "" as "approve" | "reject",
  });
  const [rejectComment, setRejectComment] = useState("");
  const { token } = useAuth();
  // Helper function to ensure full URL
  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : `https://ez-pay.realestway.com${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Collect all available images
  const getAllImages = (propertyDetails: any) => {
    const images: { url: string; label: string }[] = [];

    // Exterior Photo (Handle both casings)
    const exteriorShot =
      propertyDetails?.exteriorShot || propertyDetails?.exterior_shot;
    if (exteriorShot) {
      images.push({
        url: getFullImageUrl(exteriorShot),
        label: "Exterior Photo",
      });
    }

    // Compound/Road photo
    const compoundRoad =
      propertyDetails?.compoundRoad || propertyDetails?.compound_road;
    if (compoundRoad) {
      images.push({
        url: getFullImageUrl(compoundRoad),
        label: "Compound/Road Photo",
      });
    }

    // Interior Rooms
    const interiorRoomsRaw =
      propertyDetails?.interior_rooms || propertyDetails?.interiorRooms;
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
      // Package specific logic
      const isPrime = propertyDetails?.landlord_package === "prime" || property.landlord_package === "prime";
      const availabilityStatus = isPrime ? "available" : "upgrade_pending";

      const response = await fetch(`${API_BASE_URL}/property/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          property_registration_id: property.id,
          status: "approved",
          availability_status: availabilityStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve property");
      }

      // Call the parent's onApprove callback
      onApprove();

      // Refresh data if callback provided
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Approve property error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "There was an error approving the property."
      );
    } finally {
      setIsProcessing(false);
      closeConfirmationDialog();
    }
  };

  const handleRejectProperty = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/property/${property.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ 
            status: "rejected",
            comment: rejectComment 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject property");
      }

      // Call the parent's onReject callback
      onReject();

      // Refresh data if callback provided
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Reject property error:", error);
      alert("There was an error rejecting the property.");
    } finally {
      setIsProcessing(false);
      closeConfirmationDialog();
    }
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/property/${property.id}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPropertyDetails(data.data);
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [property.id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

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
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Property Address</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.property_address ||
                    property.property_address}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.area || property.area},{" "}
                  {propertyDetails?.state || property.state}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.typology || property.typology}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Number of Units</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.no_of_units || property.no_of_units}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Monthly Rent</Label>
                <p className="text-sm text-gray-600 font-semibold">
                  ₦
                  {propertyDetails?.rent
                    ? Math.round(
                        (parseInt(propertyDetails.rent) * 1.1) /
                          12 /
                          (propertyDetails.no_of_units || 1)
                      ).toLocaleString()
                    : property.monthly_cost
                    ? property.monthly_cost.toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Landlord Package</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      propertyDetails?.landlord_package === "prime"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {propertyDetails?.landlord_package === "prime"
                      ? "EZ-PRIME"
                      : "EZ-VANTAGE"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Status</Label>
                <Badge
                  variant={
                    propertyDetails?.status === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {propertyDetails?.status || property.status || "Pending"}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Compound & Road</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.compound_road || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.created_at
                    ? new Date(propertyDetails.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Owner Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.full_name || property.full_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.email || property.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.phone || property.phone}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Designation</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.designation || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Occupation</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.occupation || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Place of Work</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.place_of_work || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Nationality</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.nationality || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">State of Origin</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.state_of_origin || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">LGA of Origin</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.lga_of_origin || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Residential Address
                </Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails?.residential_address || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        {propertyDetails?.business_name && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Business Name</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails.business_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Business Address</Label>
                <p className="text-sm text-gray-600">
                  {propertyDetails.business_address}
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
              const allImages = getAllImages(propertyDetails);
              return allImages.length > 0 ? (
                <div className="border rounded-lg p-3 bg-gray-50 md:col-span-2 lg:col-span-3">
                  <Label className="text-sm font-medium block mb-2">
                    Property Photos ({allImages.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allImages.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="relative cursor-pointer group"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setIsCarouselOpen(true);
                        }}
                      >
                        <img
                          src={image.url}
                          alt={image.label}
                          className="w-full h-20 object-cover rounded border hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                          <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                    {allImages.length > 4 && (
                      <div
                        className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => {
                          setCurrentImageIndex(0);
                          setIsCarouselOpen(true);
                        }}
                      >
                        <span className="text-sm text-gray-600 font-medium">
                          +{allImages.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setIsCarouselOpen(true);
                    }}
                    className="mt-2 text-blue-600 hover:underline text-sm flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All Photos ({allImages.length})
                  </button>
                </div>
              ) : null;
            })()}

            {propertyDetails?.ownershipDoc && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  Ownership Document
                </Label>
                <a
                  href={getFullImageUrl(propertyDetails.ownershipDoc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Document
                </a>
              </div>
            )}
            {propertyDetails?.govId && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  Government ID
                </Label>
                <a
                  href={getFullImageUrl(propertyDetails.govId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View ID
                </a>
              </div>
            )}
            {propertyDetails?.cacCert && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium block mb-2">
                  CAC Certificate
                </Label>
                <a
                  href={getFullImageUrl(propertyDetails.cacCert)}
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
          <ImageCarousel
            images={getAllImages(propertyDetails)}
            isOpen={isCarouselOpen}
            onClose={() => setIsCarouselOpen(false)}
          />
        </div>

        {/* Property Scoring & Review */}
        {propertyDetails && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Property Scoring & Review
            </h3>
            <PropertyScoringEngine
              propertyData={{
                id: propertyDetails.id || property.id,
                full_name: propertyDetails.full_name || property.full_name,
                designation: propertyDetails.designation,
                business_name: propertyDetails.business_name,
                property_address:
                  propertyDetails.property_address || property.property_address,
                state: propertyDetails.state || property.state,
                area: propertyDetails.area || property.area,
                typology: propertyDetails.typology || property.typology,
                no_of_units:
                  propertyDetails.no_of_units || property.no_of_units,
                rent: propertyDetails.rent || property.rent,
                ownership_doc: propertyDetails.ownership_doc,
                gov_id: propertyDetails.gov_id,
                cac_cert: propertyDetails.cac_cert,
                exterior_shot: propertyDetails.exterior_shot,
                interior_rooms: (() => {
                  if (!propertyDetails.interior_rooms) return [];
                  if (Array.isArray(propertyDetails.interior_rooms))
                    return propertyDetails.interior_rooms;
                  try {
                    if (typeof propertyDetails.interior_rooms === "string") {
                      if (propertyDetails.interior_rooms.startsWith("[")) {
                        return JSON.parse(propertyDetails.interior_rooms);
                      }
                      return propertyDetails.interior_rooms
                        .split(",")
                        .map((r: string) => r.trim());
                    }
                    return [propertyDetails.interior_rooms];
                  } catch (e) {
                    return [propertyDetails.interior_rooms];
                  }
                })(),
              }}
              onScoreUpdate={(scores) => {
                // Handle score updates if needed
                console.log("Property scores updated:", scores);
              }}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t">
          {propertyDetails?.status === "approved" ? (
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
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Listing
              </Button>
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
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & List Property
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.action === "approve"
                ? "Approve Property Submission"
                : "Reject Property Submission"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.action === "approve" ? (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to approve this property submission?
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      This will:
                    </p>
                    <ul className="text-sm text-green-700 mt-2 list-disc pl-4 space-y-1">
                      <li>Approve the property for listing</li>
                      <li>Create landlord account if needed</li>
                      <li>
                        Make the property available for rental applications
                      </li>
                      <li>Send confirmation email to the property owner</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to reject this property submission?
                  </p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800">
                      This will:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 list-disc pl-4 space-y-1">
                      <li>Mark the property as rejected</li>
                      <li>Notify the property owner via email</li>
                      <li>Remove the property from pending submissions</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reject-comment" className="text-sm font-semibold">Reason for Rejection</Label>
                    <textarea
                      id="reject-comment"
                      className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter the reason for rejection (e.g., poor image quality, missing documents...)"
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Property Details:</p>
                <p className="text-sm mt-1">{property.typology}</p>
                <p className="text-sm text-gray-600">
                  {property.area}, {property.state}
                </p>
                <p className="text-sm text-gray-600">
                  Owner: {property.full_name}
                </p>
                <p className="text-sm text-gray-600">ID: {property.id}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmationDialog.action === "approve"
                  ? handleApproveProperty
                  : handleRejectProperty
              }
              disabled={isProcessing || (confirmationDialog.action === "reject" && !rejectComment)}
              className={
                confirmationDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700 disabled:opacity-50"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : confirmationDialog.action === "approve" ? (
                "Approve Property"
              ) : (
                "Reject Property"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PropertyReviewDialog;
export type { Property };
