"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Property } from "@/app/types/property";
import AdminImageManager from "./AdminImageManager";
import { Loader2, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminUpgradeMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  token: string | null;
  onSuccess: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUpgradeMediaDialog({
  open,
  onOpenChange,
  property,
  token,
  onSuccess
}: AdminUpgradeMediaDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    exterior_shot: property?.exterior_shot || "",
    compound_road: property?.compound_road || "",
    power_system: property?.power_system || "",
    interior_rooms: property?.interior_rooms || [] as string[],
  });

  // Update form data when property changes
  React.useEffect(() => {
    if (property) {
      setFormData({
        exterior_shot: property.exterior_shot || "",
        compound_road: property.compound_road || "",
        power_system: property.power_system || "",
        interior_rooms: property.interior_rooms 
          ? (Array.isArray(property.interior_rooms) ? property.interior_rooms : property.interior_rooms.split(",").map(s => s.trim()))
          : [] as string[],
      });
    }
  }, [property]);

  const handleUpdate = async () => {
    if (!property || !token) return;

    // Validation
    if (!formData.exterior_shot || !formData.compound_road || !formData.power_system || formData.interior_rooms.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Media",
        description: "Please ensure all 4 required media categories have at least one valid image.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Patch Media URLs
      const mediaResponse = await fetch(`${API_BASE_URL}/listings/${property.id}`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exterior_shot: formData.exterior_shot,
          compound_road: formData.compound_road,
          power_system: formData.power_system,
          interior_rooms: formData.interior_rooms,
          // Mandatory status update as well
          listing_status: "available",
          status: "approved" 
        }),
      });

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        throw new Error(errorData.message || "Failed to update media and status");
      }

      toast({
        title: "Upgrade Successful",
        description: `${property.code_name || "Property"} is now marked as Available with updated media.`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An error occurred during the upgrade process.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 border-none rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold font-raleway text-slate-900">
                Mandatory Media Update
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 font-medium">
              Vantage Upgrade: You are marking <span className="font-bold text-primary">"{property.code_name || property.property_address}"</span> as available. 
              Please provide current imagery for all 4 key categories to complete the upgrade.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start">
             <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
             </div>
             <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Images previously uploaded by the landlord during the submission phase are shown below. 
                Please replace any outdated photos with the latest shots of the upgraded asset.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <AdminImageManager 
              label="1. Exterior Shot (Front View) *"
              value={formData.exterior_shot}
              type="exterior_shot"
              token={token}
              onChange={(url) => setFormData(prev => ({ ...prev, exterior_shot: url as string }))}
            />

            <AdminImageManager 
              label="2. Compound / Road Access *"
              value={formData.compound_road}
              type="compound_road"
              token={token}
              onChange={(url) => setFormData(prev => ({ ...prev, compound_road: url as string }))}
            />

            <div className="md:col-span-2">
              <AdminImageManager 
                label="3. Power & Inverter System *"
                value={formData.power_system}
                type="power_system"
                token={token}
                onChange={(url) => setFormData(prev => ({ ...prev, power_system: url as string }))}
              />
            </div>

            <div className="md:col-span-2">
              <AdminImageManager 
                label="4. Interior Rooms & Finished Spaces *"
                value={formData.interior_rooms}
                type="interior_rooms"
                isMultiple={true}
                token={token}
                onChange={(urls) => setFormData(prev => ({ ...prev, interior_rooms: urls }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 flex items-center justify-end gap-4 border-t border-slate-100">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="font-bold text-slate-500 hover:text-slate-700 h-12 px-6 rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-primary/20 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing Upgrade...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" /> Confirm & Mark Available
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
