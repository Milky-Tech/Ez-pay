"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2, Save, X } from "lucide-react";
import { useAuth } from "@/context/authcontext";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  code_name: string;
  typology: string;
  number_of_units: number;
  rent: number;
  monthly_rent_ascend: number;
  monthly_rent_anchor: number;
  inspection_fee: number;
  exterior_shot: string;
  compound_road: string;
  power_system: string;
  interior_rooms: string | string[];
  listing_status: string;
  landlord_package: string;
  tenant_package: string | null;
  upgrade_loan: number | null;
  amortization_period: number | null;
  [key: string]: any;
}

interface AdminEditPropertyDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminEditPropertyDialog({
  property,
  isOpen,
  onClose,
  onSuccess,
}: AdminEditPropertyDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Property>>({});

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        interior_rooms: Array.isArray(property.interior_rooms)
          ? property.interior_rooms.join(", ")
          : property.interior_rooms || "",
      });
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!property?.id || !token) return;

    setIsSaving(true);
    try {
      // Prepare data for PATCH
      const patchData = { ...formData };
      
      // Convert interior_rooms back to array if it's a string
      if (typeof patchData.interior_rooms === "string") {
        patchData.interior_rooms = patchData.interior_rooms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
      }

      const response = await fetch(`${API_BASE_URL}/listings/${property.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update listing");
      }

      toast({
        title: "Listing Updated",
        description: `Listing ${property.code_name || property.id} updated successfully.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update listing.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing: {property.code_name || `#${property.id}`}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-500 border-b pb-1">Basic Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="typology">Typology</Label>
              <Input
                id="typology"
                name="typology"
                value={formData.typology || ""}
                onChange={handleChange}
                placeholder="e.g. 2 Bedroom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_units">Number of Units</Label>
              <Input
                id="number_of_units"
                name="number_of_units"
                type="number"
                value={formData.number_of_units ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landlord_package">Landlord Package</Label>
              <Select
                value={formData.landlord_package || "prime"}
                onValueChange={(v) => handleSelectChange("landlord_package", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prime">Prime</SelectItem>
                  <SelectItem value="vantage">Vantage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listing_status">Listing Status</Label>
              <Select
                value={formData.listing_status || "available"}
                onValueChange={(v) => handleSelectChange("listing_status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="upgrade_pending">Upgrade Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-500 border-b pb-1">Pricing & Fees</h3>
            
            <div className="space-y-2">
              <Label htmlFor="rent">Annual Rent (Base)</Label>
              <Input
                id="rent"
                name="rent"
                type="number"
                value={formData.rent ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_rent_ascend">Monthly Rent (Ascend)</Label>
              <Input
                id="monthly_rent_ascend"
                name="monthly_rent_ascend"
                type="number"
                value={formData.monthly_rent_ascend ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_rent_anchor">Monthly Rent (Anchor)</Label>
              <Input
                id="monthly_rent_anchor"
                name="monthly_rent_anchor"
                type="number"
                value={formData.monthly_rent_anchor ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspection_fee">Inspection Fee</Label>
              <Input
                id="inspection_fee"
                name="inspection_fee"
                type="number"
                value={formData.inspection_fee ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Financing Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-500 border-b pb-1">Financing</h3>
            
            <div className="space-y-2">
              <Label htmlFor="upgrade_loan">Upgrade Loan Amount</Label>
              <Input
                id="upgrade_loan"
                name="upgrade_loan"
                type="number"
                value={formData.upgrade_loan ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amortization_period">Amortization Period (Months)</Label>
              <Input
                id="amortization_period"
                name="amortization_period"
                type="number"
                value={formData.amortization_period ?? ""}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tenant_package">Tenant Package</Label>
              <Input
                id="tenant_package"
                name="tenant_package"
                value={formData.tenant_package || ""}
                onChange={handleChange}
                placeholder="e.g. Standard"
              />
            </div>
          </div>

          {/* Media Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-500 border-b pb-1">Media Paths</h3>
            
            <div className="space-y-2">
              <Label htmlFor="exterior_shot">Exterior Shot Path</Label>
              <Input
                id="exterior_shot"
                name="exterior_shot"
                value={formData.exterior_shot || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compound_road">Compound/Road Path</Label>
              <Input
                id="compound_road"
                name="compound_road"
                value={formData.compound_road || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="power_system">Power System Path</Label>
              <Input
                id="power_system"
                name="power_system"
                value={formData.power_system || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Interior Rooms (Full Width) */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="interior_rooms">Interior Rooms Paths (Comma separated)</Label>
            <Textarea
              id="interior_rooms"
              name="interior_rooms"
              value={formData.interior_rooms || ""}
              onChange={handleChange}
              rows={4}
              placeholder="/storage/uploads/images/file1.jpg, /storage/uploads/images/file2.jpg"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
