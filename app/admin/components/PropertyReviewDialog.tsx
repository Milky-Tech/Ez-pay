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
} from "lucide-react";

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

const PropertyReviewDialog = ({
  property,
  onApprove,
  onReject,
}: PropertyReviewDialogProps) => {
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          {propertyDetails?.ownershipDoc && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <Label className="text-sm font-medium block mb-2">
                Ownership Document
              </Label>
              <a
                href={propertyDetails.ownershipDoc}
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
                href={propertyDetails.govId}
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
                href={propertyDetails.cacCert}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                View Certificate
              </a>
            </div>
          )}
          {propertyDetails?.exteriorShot && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <Label className="text-sm font-medium block mb-2">
                Exterior Photo
              </Label>
              <a
                href={propertyDetails.exteriorShot}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                View Photo
              </a>
            </div>
          )}
        </div>
      </div>

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
