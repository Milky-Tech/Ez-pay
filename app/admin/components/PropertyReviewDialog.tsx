"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import PropertyScoringEngine from "./PropertyScoringEngine";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

// Interface definitions
interface Property {
  id: string;
  code_name: string;
  topology: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  availability_status: string;
  status?: string; // Submission status: approved, pending, in_review, etc.
  fullName: string;
  property_address: string;
  noOfUnits: number;
  rent: number;
  createdAt: string;
  updatedAt: string;
}

interface PropertyReviewDialogProps {
  property: Property;
  onApprove: () => void;
  onReject: () => void;
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
}: PropertyReviewDialogProps) => {
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

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

    if (propertyDetails?.exteriorShot) {
      images.push({
        url: getFullImageUrl(propertyDetails.exteriorShot),
        label: "Exterior Photo",
      });
    }

    if (
      propertyDetails?.interiorRooms &&
      Array.isArray(propertyDetails.interiorRooms)
    ) {
      propertyDetails.interiorRooms.forEach((room: string, index: number) => {
        images.push({
          url: getFullImageUrl(room),
          label: `Interior Room ${index + 1}`,
        });
      });
    }

    return images;
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/landlords/property/${property.id}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  }, [property.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

  return (
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
                {propertyDetails?.property_address || property.property_address}
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
                {propertyDetails?.topology || property.topology}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Number of Units</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails?.noOfUnits || property.noOfUnits}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Monthly Rent</Label>
              <p className="text-sm text-gray-600 font-semibold">
                ₦
                {propertyDetails?.rent
                  ? Math.round(
                      (parseInt(propertyDetails.rent) * 1.1) / 12
                    ).toLocaleString()
                  : property.monthly_cost
                  ? property.monthly_cost.toLocaleString()
                  : "N/A"}
              </p>
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
                {propertyDetails?.status || "Pending"}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails?.createdAt
                  ? new Date(propertyDetails.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Updated</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails?.updatedAt
                  ? new Date(propertyDetails.updatedAt).toLocaleDateString()
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
                {propertyDetails?.fullName || property.fullName}
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
                {propertyDetails?.placeOfWork || "N/A"}
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
                {propertyDetails?.stateOfOrigin || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">LGA of Origin</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails?.lgaOfOrigin || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Residential Address</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails?.residentialAddress || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      {propertyDetails?.businessName && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Business Name</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails.businessName}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Business Address</Label>
              <p className="text-sm text-gray-600">
                {propertyDetails.businessAddress}
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
              fullName: propertyDetails.fullName || property.fullName,
              designation: propertyDetails.designation,
              businessName: propertyDetails.businessName,
              property_address:
                propertyDetails.property_address || property.property_address,
              state: propertyDetails.state || property.state,
              area: propertyDetails.area || property.area,
              topology: propertyDetails.topology || property.topology,
              noOfUnits: propertyDetails.noOfUnits || property.noOfUnits,
              rent: propertyDetails.rent || property.rent,
              ownershipDoc: propertyDetails.ownershipDoc,
              govId: propertyDetails.govId,
              cacCert: propertyDetails.cacCert,
              exteriorShot: propertyDetails.exteriorShot,
              interiorRooms: propertyDetails.interiorRooms || [],
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
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Eye className="h-4 w-4 mr-2" />
              View Listing
            </Button>
          </>
        ) : (
          <>
            <Button variant="destructive" onClick={onReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Submission
            </Button>
            <Button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & List Property
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyReviewDialog;
export type { Property };
