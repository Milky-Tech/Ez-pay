"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
  Shield,
  Wrench,
  Zap,
  Battery,
  Sun,
  Thermometer,
  Droplets,
  CheckCircle,
  VolumeX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { NIGERIAN_STATES_LGAS } from "@/lib/nigerian-states";

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  user_id: string;
  onSuccess: () => void;
  toast: (props: {
    variant?: "default" | "destructive";
    title?: string;
    description?: string;
  }) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

export const AddPropertyDialog = ({
  open,
  onOpenChange,
  token,
  user_id,
  onSuccess,
  toast,
}: AddPropertyDialogProps) => {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    aesthetics: false,
    power: false,
    comfort: false,
    compound: false,
  });

  const [formData, setFormData] = useState({
    property_address: "",
    state: "",
    area: "",
    typology: "",
    number_of_units: "1",
    rent: "",
    compound_road: "",
    power_system: "",
    interior_rooms: [] as string[],
    exterior_shot: "",
    landlord_package: "",
  });

  const {
    uploadedFiles,
    handleFileUpload,
    handleBulkInteriorUpload,
    removeFile,
    clearUploads,
    getFileByType,
    getInteriorRoomFiles,
  } = useFileUpload(token);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClose = () => {
    onOpenChange(false);
    clearUploads();
    setFormData({
      property_address: "",
      state: "",
      area: "",
      typology: "",
      number_of_units: "1",
      rent: "",
      compound_road: "",
      power_system: "",
      interior_rooms: [],
      exterior_shot: "",
      landlord_package: "",
    });
    setConsentGiven(false);
  };

  const handleAddProperty = async () => {
    if (!token || !user_id) return;

    if (!consentGiven) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description:
          "Please confirm that your property meets the ACCESSS standard",
      });
      return;
    }

    const compoundRoadUrl = getFileByType("compound_road")?.url;
    const powerSystemUrl = getFileByType("power_system")?.url;
    const exteriorShotUrl = getFileByType("exterior_shot")?.url;
    const interiorUrls = getInteriorRoomFiles()
      .map((f) => f.url)
      .filter(Boolean) as string[];

    if (!compoundRoadUrl || !powerSystemUrl || !exteriorShotUrl) {
      toast({
        variant: "destructive",
        title: "Missing Files",
        description: "Please upload all required property images",
      });
      return;
    }

    if (interiorUrls.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Interior Photos",
        description: "Please upload at least one interior room photo",
      });
      return;
    }

    setIsAddingProperty(true);
    try {
      const propertyData = {
        ...formData,
        landlord_id: user_id,
        number_of_units: parseInt(formData.number_of_units) || 1,
        rent: parseInt(formData.rent) || 0,
        compound_road: compoundRoadUrl,
        power_system: powerSystemUrl,
        exterior_shot: exteriorShotUrl,
        lead_image_url: exteriorShotUrl, // Fix: Use exterior shot as lead image
        interior_rooms: interiorUrls,
        landlord_package: formData.landlord_package, // Default package
      };

      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        toast({
          title: "Property Added",
          description: "Your property has been added successfully",
        });
        handleClose();
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add property");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        variant: "destructive",
        title: "Add Property Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add property. Please try again.",
      });
    } finally {
      setIsAddingProperty(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-raleway">
            Add New Property
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="property_address" className="text-sm">
                  Property Address *
                </Label>
                <Input
                  id="property_address"
                  value={formData.property_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      property_address: e.target.value,
                    })
                  }
                  placeholder="123 Main St"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm">
                  State *
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(v) =>
                    setFormData({ ...formData, state: v, area: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(NIGERIAN_STATES_LGAS).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="area" className="text-sm">
                  Local Government (Area) *
                </Label>
                <Select
                  value={formData.area}
                  onValueChange={(v) => setFormData({ ...formData, area: v })}
                  disabled={!formData.state}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.state ? "Select LGA" : "Select state first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.state &&
                      NIGERIAN_STATES_LGAS[formData.state]?.map((lga) => (
                        <SelectItem key={lga} value={lga}>
                          {lga}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="typology" className="text-sm">
                  Property Type *
                </Label>
                <Select
                  value={formData.typology}
                  onValueChange={(v) =>
                    setFormData({ ...formData, typology: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "1 Bedroom",
                      "2 Bedroom",
                      "3 Bedroom",
                      "4 Bedroom",
                      "5 Bedroom",
                      "Duplex",
                      "Apartment",
                      "Villa",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="typology" className="text-sm">
                  Package *
                </Label>
                <Select
                  value={formData.landlord_package}
                  onValueChange={(v) =>
                    setFormData({ ...formData, landlord_package: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Prime", "Vantage"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="number_of_units" className="text-sm">
                  Units *
                </Label>
                <Input
                  id="number_of_units"
                  type="number"
                  value={formData.number_of_units}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_units: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="rent" className="text-sm">
                  Monthly Rent (₦) *
                </Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.rent}
                  onChange={(e) =>
                    setFormData({ ...formData, rent: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">
              Property Images
            </h3>

            <div className="space-y-2">
              <Label className="text-sm">Compound/Road Image *</Label>
              <UploadBox
                type="compound_road"
                file={getFileByType("compound_road")}
                onUpload={(f) => handleFileUpload(f, "compound_road")}
                onRemove={(id) => removeFile(id)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Power System Image *</Label>
              <UploadBox
                type="power_system"
                file={getFileByType("power_system")}
                onUpload={(f) => handleFileUpload(f, "power_system")}
                onRemove={(id) => removeFile(id)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Exterior Shot Image *</Label>
              <UploadBox
                type="exterior_shot"
                file={getFileByType("exterior_shot")}
                onUpload={(f) => handleFileUpload(f, "exterior_shot")}
                onRemove={(id) => removeFile(id)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Interior Room Images *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-2">
                  Upload multiple interior photos
                </p>
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  Choose Files
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleBulkInteriorUpload(Array.from(e.target.files || []))
                    }
                  />
                </label>
              </div>
              {getInteriorRoomFiles().length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {getInteriorRoomFiles().map((file) => (
                    <div
                      key={file.id}
                      className="border rounded-lg p-2 flex items-center justify-between"
                    >
                      <span className="text-sm truncate max-w-[200px]">
                        {file.file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACCESSS Standard details remain same as original for quality */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-raleway text-xl sm:text-2xl flex items-center gap-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                The ACCESSS Standard
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base">
                We only manage assets that deliver House Serenity.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <AccordionItem
                title="A. Aesthetics & Finishing"
                icon={Wrench}
                isOpen={expandedSections.aesthetics}
                onToggle={() => toggleSection("aesthetics")}
                content={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <StandardDetail
                      title="Paint & Walls"
                      text="Newly painted with premium washable matte finish. Walls must be smooth and free of defects."
                    />
                    <StandardDetail
                      title="Flooring"
                      text="High-grade ceramic/porcelain tiles (min. 60x60cm) or premium wood laminate."
                    />
                  </div>
                }
              />
              <AccordionItem
                title="B. Power Systems"
                icon={Zap}
                isOpen={expandedSections.power}
                onToggle={() => toggleSection("power")}
                content={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StandardDetail
                      title="Guaranteed Supply"
                      text="10 Hours Night: 7PM-5AM; 5 Hours Day: 10AM-3PM."
                    />
                    <StandardDetail
                      title="Systems"
                      text="Solar & Inverter preferred. Soundproofed generators required."
                    />
                  </div>
                }
              />
              <AccordionItem
                title="C. Comfort & Space"
                icon={Thermometer}
                isOpen={expandedSections.comfort}
                onToggle={() => toggleSection("comfort")}
                content={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StandardDetail
                      title="Ventilation"
                      text="Min. 15% window-to-wall ratio. Cross-ventilation required."
                    />
                    <StandardDetail
                      title="A/C"
                      text="Mandatory split units in all bedrooms and living areas."
                    />
                  </div>
                }
              />
              <AccordionItem
                title="D. Compound & Environment"
                icon={Droplets}
                isOpen={expandedSections.compound}
                onToggle={() => toggleSection("compound")}
                content={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StandardDetail
                      title="Access"
                      text="Paved access road. Internal compound interlocked."
                    />
                    <StandardDetail
                      title="Security"
                      text="Secured walls (min 2.4m) with barb wire/electric fence."
                    />
                  </div>
                }
              />
            </CardContent>
          </Card>

          <div className="flex items-start space-x-2 p-4 border rounded-lg bg-blue-50">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(c) => setConsentGiven(!!c)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="consent" className="text-sm font-medium">
                Compliance
              </Label>
              <p className="text-xs text-gray-600">
                I confirm my property meets ACCESSS standards.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAddingProperty}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddProperty}
            disabled={isAddingProperty || !consentGiven}
            className="bg-primary"
          >
            {isAddingProperty ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              "Add Property"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface UploadBoxProps {
  type: UploadedFile["type"];
  file?: UploadedFile;
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
}

const UploadBox = ({ type, file, onUpload, onRemove }: UploadBoxProps) => {
  if (file) {
    return (
      <div className="border rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-4 w-4 text-gray-400" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{file.file.name}</p>
            <p className="text-xs text-gray-500">
              {file.uploading
                ? "Uploading..."
                : file.error
                ? "Error"
                : "Uploaded ✓"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onRemove(file.id)}
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    );
  }
  return (
    <div className="border-2 border-dashed rounded-lg p-4 text-center">
      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
      <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
        Choose File
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </label>
    </div>
  );
};

interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  content: React.ReactNode;
}

const AccordionItem = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  content,
}: AccordionItemProps) => (
  <div className="border rounded-lg overflow-hidden">
    <div
      className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-200"
      onClick={onToggle}
    >
      <h3 className="font-semibold text-sm sm:text-base text-primary flex items-center gap-2">
        <Icon className="h-4 w-4" /> {title}
      </h3>
      {isOpen ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </div>
    {isOpen && <div className="p-3 bg-white text-sm">{content}</div>}
  </div>
);

interface StandardDetailProps {
  title: string;
  text: string;
}

const StandardDetail = ({ title, text }: StandardDetailProps) => (
  <div className="p-3 bg-blue-50 rounded">
    <h4 className="font-semibold text-primary text-xs sm:text-sm">{title}</h4>
    <p className="text-xs text-gray-600">{text}</p>
  </div>
);
