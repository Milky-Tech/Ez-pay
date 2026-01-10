"use client";

import { Building, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: any;
  onViewDetails: (id: string) => void;
}

export const PropertyCard = ({ property, onViewDetails }: PropertyCardProps) => {
  return (
    <Card
      className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onViewDetails(property.id)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={property.lead_image_url || "/placeholder-property.jpg"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              alt={property.typology}
            />
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-bold text-slate-900 truncate text-sm sm:text-base">
              {property.code_name || property.typology}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500">
              {property.typology} • {property.area}, {property.state}
            </p>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {property.bedrooms} Beds
              </Badge>
              <Badge variant="outline" className="text-xs">
                {property.bathrooms} Baths
              </Badge>
              {property.square_feet && (
                <Badge variant="outline" className="text-xs">
                  {property.square_feet?.toLocaleString()} sqft
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {property.noOfUnits} Units
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 text-sm sm:text-base">
              ₦{(property.monthly_cost || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">per month</p>
            <Badge
              className={`mt-1 sm:mt-2 text-xs ${
                property.availability_status === "available"
                  ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-100"
                  : property.availability_status === "rented"
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-100"
              }`}
            >
              {property.availability_status === "available"
                ? "Available"
                : property.availability_status === "rented"
                ? "Rented"
                : property.availability_status}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
