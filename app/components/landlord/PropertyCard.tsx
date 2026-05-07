"use client";

import { Building, ChevronRight, Edit3, Send, Eye, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface PropertyCardProps {
  property: any;
  onViewDetails: (id: string) => void;
  isDraft?: boolean;
  onEditDraft?: (id: string) => void;
}

const getStatusConfig = (property: any) => {
  if (property.is_draft && property.status !== "rejected") {
    return { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200", icon: null };
  }
  if (property.status === "pending") {
    return { label: "Pending Review", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
  }
  if (property.status === "rejected") {
    return { label: "Action Required", className: "bg-red-50 text-red-700 border-red-200", icon: null };
  }
  if (property.listing_status === "available") {
    return { label: "Available", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 };
  }
  if (property.listing_status === "rented") {
    return { label: "Rented", className: "bg-blue-50 text-blue-700 border-blue-200", icon: null };
  }
  if (property.listing_status === "pending_upgrade" || property.listing_status === "upgrade_pending") {
    return { label: "Upgrade Pending", className: "bg-purple-50 text-purple-700 border-purple-200", icon: Sparkles };
  }
  return { label: property.listing_status || property.status || "Unknown", className: "bg-slate-50 text-slate-600 border-slate-200", icon: null };
};

export const PropertyCard = ({
  property,
  onViewDetails,
  isDraft = false,
  onEditDraft,
}: PropertyCardProps) => {
  const statusConfig = getStatusConfig(property);
  const StatusIcon = statusConfig.icon;

  const monthlyRent = Math.round(
    property.rent
      ? (property.rent * 1.1) / 12 / (property.noOfUnits || property.no_of_units || 1)
      : property.monthly_cost || 0
  );

  return (
    <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden group">
      <CardContent className="p-0">
        {/* Image + Info row */}
        <div className="flex items-stretch gap-0">
          {/* Thumbnail */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative overflow-hidden">
            <img
              src={property.lead_image_url || "/placeholder-property.jpg"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              alt={property.typology}
            />
            {isDraft && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold uppercase tracking-wider bg-black/50 px-1.5 py-0.5 rounded">Draft</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow min-w-0 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 truncate text-sm leading-tight">
                  {property.code_name || property.typology || "Untitled Property"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {property.area && property.state
                    ? `${property.area}, ${property.state}`
                    : property.property_address || "—"}
                </p>
              </div>
              {/* Status badge */}
              <Badge className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.className}`}>
                {StatusIcon && <StatusIcon className="h-2.5 w-2.5" />}
                {statusConfig.label}
              </Badge>
            </div>

            {/* Specs row */}
            <div className="flex flex-wrap gap-1 mt-2">
              {property.bedrooms && (
                <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-600">
                  {property.bedrooms}bd
                </span>
              )}
              {property.bathrooms && (
                <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-600">
                  {property.bathrooms}ba
                </span>
              )}
              {property.typology && (
                <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-600 truncate max-w-[80px]">
                  {property.typology}
                </span>
              )}
              {monthlyRent > 0 && (
                <span className="text-[10px] font-bold text-[#9A2A2A] bg-[#9A2A2A]/5 border border-[#9A2A2A]/10 px-1.5 py-0.5 rounded-md">
                  ₦{monthlyRent.toLocaleString()}/mo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons row — always visible on mobile */}
        <div className={`flex border-t border-slate-100 divide-x divide-slate-100 ${isDraft ? "bg-amber-50/40" : ""}`}>
          {isDraft ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDraft?.(property.id);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#9A2A2A] hover:bg-[#9A2A2A]/5 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Draft
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(property.id);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Preview & Publish
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(property.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
