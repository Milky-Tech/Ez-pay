"use client";

import React, { useState } from "react";
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
  Camera,
  AlertTriangle,
  Info,
  Home,
  File,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { NIGERIAN_STATES_LGAS } from "@/lib/nigerian-states";
import { LiveCameraModal } from "@/app/components/ui/live-camera-modal";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const AddPropertyDialog = ({
  open,
  onOpenChange,
  token,
  user_id,
  onSuccess,
  toast,
}: AddPropertyDialogProps) => {
  const [formStep, setFormStep] = useState(0);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    aesthetics: false,
    power: false,
    comfort: false,
    compound: false,
  });

  const [cameraConfig, setCameraConfig] = useState<{
    open: boolean;
    type: UploadedFile["type"] | null;
    isMultiple: boolean;
  }>({
    open: false,
    type: null,
    isMultiple: false,
  });

  const [formData, setFormData] = useState({
    property_address: "",
    state: "",
    area: "",
    typology: "",
    rent: "",
    bedrooms: "",
    bathrooms: "",
    parking_space: "",
    compound_road: "",
    power_system: "",
    interior_rooms: [] as string[],
    exterior_shot: "",
    landlord_package: "prime",
    deeds_of_assignment: "",
    building_approval: "",
    c_of_o: "",
  });

  const {
    uploadedFiles,
    handleFileUpload,
    handleBulkInteriorUpload,
    removeFile,
    clearUploads,
    getFileByType,
    getFilesByType,
    getInteriorRoomFiles,
  } = useFileUpload(token);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const validateStep0 = () => {
    if (
      !formData.property_address ||
      !formData.state ||
      !formData.area ||
      !formData.typology ||
      !formData.rent ||
      !formData.landlord_package
    ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description:
          "Please fill in all required fields in the Basic Information section.",
      });
      return false;
    }
    return true;
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormStep(0);
    clearUploads();
    setFormData({
      property_address: "",
      state: "",
      area: "",
      typology: "",
      rent: "",
      bedrooms: "",
      bathrooms: "",
      parking_space: "",
      compound_road: "",
      power_system: "",
      interior_rooms: [],
      exterior_shot: "",
      landlord_package: "prime",
      deeds_of_assignment: "",
      building_approval: "",
      c_of_o: "",
    });
    setConsentGiven(false);
  };

  const handleAddProperty = async () => {
    if (!token || !user_id) return;

    const isVantage = formData.landlord_package === "vantage";
    const isPrime = formData.landlord_package === "prime";

    if (!isVantage && !consentGiven) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description:
          "Please confirm that your property meets the ACCESSS standard",
      });
      return;
    }

    const compoundRoadUrl = getFileByType("compound_road")?.url;
    const powerFiles = getFilesByType("power_system");
    const powerSystemUrl = powerFiles[0]?.url; // Use first one as main if needed by API
    const exteriorShotUrl = getFileByType("exterior_shot")?.url;

    // Enforce power picture if Prime
    if (isPrime && powerFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Requirement",
        description: "Power System Image is compulsory for Prime package.",
      });
      return;
    }

    const interiorFiles = getInteriorRoomFiles();
    const interiorUrls = interiorFiles
      .map((f) => f.url)
      .filter(Boolean) as string[];

    const deedsUrl = getFileByType("deeds_of_assignment")?.url;
    const approvalUrl = getFileByType("building_approval")?.url;

    if (!compoundRoadUrl || !exteriorShotUrl || !deedsUrl || !approvalUrl) {
      toast({
        variant: "destructive",
        title: "Missing Files",
        description:
          "Please upload all required property documents (Compound, Exterior Shot, Deeds of Assignment, and Building Approval)",
      });
      return;
    }

    const kitchenFiles = getFilesByType("kitchen");
    const bathFiles = getFilesByType("rest_room");

    const unvalidatedKitchen = kitchenFiles.some((f) => !f.aiValidated);
    const unvalidatedBath = bathFiles.some((f) => !f.aiValidated);
    const unvalidatedExterior = !getFileByType("exterior_shot")?.aiValidated;

    if (unvalidatedKitchen || unvalidatedBath || unvalidatedExterior) {
      toast({
        variant: "destructive",
        title: "AI Quality Check Failed",
        description:
          "One or more required photos (Kitchen, Bath, or Exterior) were not validated by AI. Please retake them with better guidance.",
      });
      return;
    }

    setIsAddingProperty(true);
    try {
      const propertyData = {
        ...formData,
        landlord_id: user_id,
        rent: parseInt(formData.rent) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        parking_space: parseInt(formData.parking_space) || 0,
        compound_road: compoundRoadUrl,
        power_system: powerSystemUrl,
        exterior_shot: exteriorShotUrl,
        lead_image_url: exteriorShotUrl,
        interior_rooms: interiorUrls,
        deeds_of_assignment: deedsUrl,
        building_approval: approvalUrl,
        landlord_package: formData.landlord_package,
        c_of_o: getFileByType("c_of_o")?.url || "",
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
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 gap-0 sm:max-w-3xl rounded-2xl border-slate-200/60 shadow-2xl shadow-black/10">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a0a] px-6 pt-6 pb-5">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_70%_50%,#C9A227,transparent_60%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-5 bg-[#9A2A2A] rounded-full" />
              <span className="text-[10px] text-[#C9A227] uppercase tracking-[0.2em] font-bold">
                Landlord · Add Property
              </span>
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white font-raleway">
                {formStep === 0 ? "Property Details" : "Property Imagery"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-white/40 mt-1">
              Step {formStep + 1} of 2 — {formStep === 0 ? "Basic information & compliance" : "Photos & documents"}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setFormStep(0)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                formStep === 0 ? "bg-[#9A2A2A]" : "bg-white/20"
              }`}
            />
            <button
              onClick={() => validateStep0() && setFormStep(1)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                formStep === 1 ? "bg-[#9A2A2A]" : "bg-white/10"
              }`}
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-premium px-6 py-6 space-y-8">
          {formStep === 0 ? (
            <>
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-primary">
                    Basic Information
                  </h3>
                </div>
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
                      onValueChange={(v) =>
                        setFormData({ ...formData, area: v })
                      }
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
                    <Label htmlFor="rent" className="text-sm">
                      Monthly Rent Expected (₦) *
                    </Label>
                    <Input
                      id="rent"
                      type="number"
                      value={formData.rent}
                      onChange={(e) =>
                        setFormData({ ...formData, rent: e.target.value })
                      }
                      placeholder="e.g. 100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms" className="text-sm">
                      Bedrooms *
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: e.target.value })
                      }
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms" className="text-sm">
                      Bathrooms *
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                      placeholder="e.g. 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parking_space" className="text-sm">
                      Parking Space *
                    </Label>
                    <Input
                      id="parking_space"
                      type="number"
                      value={formData.parking_space}
                      onChange={(e) =>
                        setFormData({ ...formData, parking_space: e.target.value })
                      }
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>
              </div>

              {formData.landlord_package !== "vantage" && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-raleway text-xl flex items-center gap-2 text-primary">
                      <Shield className="h-5 w-5" />
                      The ACCESSS Standard
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      We only manage assets that deliver House Serenity.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <AccordionItem
                      title="A. Aesthetics & Finishing"
                      icon={Wrench}
                      isOpen={expandedSections.aesthetics}
                      onToggle={() => toggleSection("aesthetics")}
                      content={
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <StandardDetail
                            title="Paint & Walls"
                            text="Newly painted with premium washable matte finish."
                          />
                          <StandardDetail
                            title="Flooring"
                            text="High-grade ceramic/porcelain tiles (min. 60x60cm)."
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
                            text="Solar/Inverter preferred. Silent generators required."
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
                            text="Min. 15% window-to-wall ratio. Cross-ventilation."
                          />
                          <StandardDetail
                            title="A/C"
                            text="Mandatory split units in all major areas."
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
                            text="Paved road. Internal compound interlocked."
                          />
                          <StandardDetail
                            title="Security"
                            text="Secured walls (min 2.4m) with electric fence."
                          />
                        </div>
                      }
                    />
                  </CardContent>
                </Card>
              )}

              {formData.landlord_package !== "vantage" && (
                <div className="flex items-start space-x-2 p-4 border rounded-lg bg-blue-50">
                  <Checkbox
                    id="consent"
                    checked={consentGiven}
                    onCheckedChange={(c) => setConsentGiven(!!c)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="consent" className="text-sm font-medium">
                      Compliance Confirmation
                    </Label>
                    <p className="text-xs text-gray-600">
                      I confirm my property meets ACCESSS standards. Missing
                      criteria may lead to rejection.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 border-b pb-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-primary">
                  Property Imagery
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      Compound/Road Image *
                    </Label>
                    <Badge variant="outline" className="text-[10px]">
                      Required
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    Criteria: Show the access road and compound entrance. Must
                    be well-lit.
                  </p>
                  <UploadBox
                    type="compound_road"
                    file={getFileByType("compound_road")}
                    onUpload={(f) => handleFileUpload(f, "compound_road")}
                    onTrigger={() =>
                      setCameraConfig({
                        open: true,
                        type: "compound_road",
                        isMultiple: false,
                      })
                    }
                    onRemove={(id) => removeFile(id)}
                    instruction="Show clear view of the compound and access road."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      Exterior Shot Image *
                    </Label>
                    <Badge variant="outline" className="text-[10px]">
                      Main Photo
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    Criteria: Full view of the building exterior. Best during
                    daylight.
                  </p>
                  <UploadBox
                    type="exterior_shot"
                    file={getFileByType("exterior_shot")}
                    onUpload={(f) => handleFileUpload(f, "exterior_shot")}
                    onTrigger={() =>
                      setCameraConfig({
                        open: true,
                        type: "exterior_shot",
                        isMultiple: false,
                      })
                    }
                    onRemove={(id) => removeFile(id)}
                    instruction="High-quality front view of the building."
                  />
                </div>

                <div
                  className={`space-y-3 md:col-span-2 ${formData.landlord_package === "prime" ? "p-4 border border-amber-200 bg-amber-50 rounded-lg" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      Power System Image{" "}
                      {formData.landlord_package === "prime" && "*"}
                    </Label>
                    <div className="flex gap-2">
                      {formData.landlord_package === "prime" && (
                        <Badge className="bg-amber-500 text-[10px]">
                          Compulsory for Prime
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {getFilesByType("power_system").length} photos
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    Criteria: Show the generator, inverter, or solar setup
                    currently in place.
                  </p>
                  <UploadBox
                    type="power_system"
                    onUpload={(f) => handleFileUpload(f, "power_system", true)}
                    onTrigger={() =>
                      setCameraConfig({
                        open: true,
                        type: "power_system",
                        isMultiple: true,
                      })
                    }
                    onRemove={(id) => removeFile(id)}
                    instruction="Clear shot of the operational power source."
                    multi
                  />
                  <StagingArea
                    files={getFilesByType("power_system")}
                    onRemove={removeFile}
                  />
                  {formData.landlord_package === "prime" &&
                    getFilesByType("power_system").length === 0 && (
                      <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> Mandatory for
                        Prime package.
                      </p>
                    )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      C of O (Certificate of Occupancy)
                    </Label>
                    <Badge variant="outline" className="text-[10px]">
                      Optional Document
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    Criteria: Upload a clear scan or photo of the property's
                    Certificate of Occupancy.
                  </p>
                  <UploadBox
                    type="c_of_o"
                    file={getFileByType("c_of_o")}
                    onUpload={(f) => handleFileUpload(f, "c_of_o")}
                    onRemove={(id) => removeFile(id)}
                    instruction="Upload official property title document (PDF or photo)."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      Deed of Assignment *
                    </Label>
                    <Badge variant="outline" className="text-[10px]">
                      Required Document
                    </Badge>
                  </div>
                  <UploadBox
                    type="deeds_of_assignment"
                    file={getFileByType("deeds_of_assignment")}
                    onUpload={(f) => handleFileUpload(f, "deeds_of_assignment")}
                    onRemove={(id) => removeFile(id)}
                    instruction="Upload Deed of Assignment (PDF or photo of document)."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold">
                      Building Approval *
                    </Label>
                    <Badge variant="outline" className="text-[10px]">
                      Required Document
                    </Badge>
                  </div>
                  <UploadBox
                    type="building_approval"
                    file={getFileByType("building_approval")}
                    onUpload={(f) => handleFileUpload(f, "building_approval")}
                    onRemove={(id) => removeFile(id)}
                    instruction="Upload Building Approval plan (PDF or photo)."
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Home className="h-4 w-4 text-primary" />
                  <h4 className="font-bold text-base text-primary">
                    Interior Details (Multiple Photos Allowed)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold">Living Room</Label>
                      <Badge variant="secondary" className="text-[10px]">
                        {getFilesByType("living_room").length} photos
                      </Badge>
                    </div>
                    <UploadBox
                      type="living_room"
                      onUpload={(f) => handleFileUpload(f, "living_room", true)}
                      onTrigger={() =>
                        setCameraConfig({
                          open: true,
                          type: "living_room",
                          isMultiple: true,
                        })
                      }
                      onRemove={(id) => removeFile(id)}
                      instruction="Capture the main living space from multiple angles."
                      multi
                    />
                    <StagingArea
                      files={getFilesByType("living_room")}
                      onRemove={removeFile}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold">Bedrooms</Label>
                      <Badge variant="secondary" className="text-[10px]">
                        {getFilesByType("bedroom").length} photos
                      </Badge>
                    </div>
                    <UploadBox
                      type="bedroom"
                      onUpload={(f) => handleFileUpload(f, "bedroom", true)}
                      onTrigger={() =>
                        setCameraConfig({
                          open: true,
                          type: "bedroom",
                          isMultiple: true,
                        })
                      }
                      onRemove={(id) => removeFile(id)}
                      instruction="Show each bedroom clearly including closets."
                      multi
                    />
                    <StagingArea
                      files={getFilesByType("bedroom")}
                      onRemove={removeFile}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold">Kitchen</Label>
                      <Badge variant="secondary" className="text-[10px]">
                        {getFilesByType("kitchen").length} photos
                      </Badge>
                    </div>
                    <UploadBox
                      type="kitchen"
                      onUpload={(f) => handleFileUpload(f, "kitchen", true)}
                      onTrigger={() =>
                        setCameraConfig({
                          open: true,
                          type: "kitchen",
                          isMultiple: true,
                        })
                      }
                      onRemove={(id) => removeFile(id)}
                      instruction="Focus on cabinets, sink, and workspace."
                      multi
                    />
                    <StagingArea
                      files={getFilesByType("kitchen")}
                      onRemove={removeFile}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold">Rest Rooms</Label>
                      <Badge variant="secondary" className="text-[10px]">
                        {getFilesByType("rest_room").length} photos
                      </Badge>
                    </div>
                    <UploadBox
                      type="rest_room"
                      onUpload={(f) => handleFileUpload(f, "rest_room", true)}
                      onTrigger={() =>
                        setCameraConfig({
                          open: true,
                          type: "rest_room",
                          isMultiple: true,
                        })
                      }
                      onRemove={(id) => removeFile(id)}
                      instruction="Capture toilets, showers, and tiling."
                      multi
                    />
                    <StagingArea
                      files={getFilesByType("rest_room")}
                      onRemove={removeFile}
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold">
                        Others (Balconies, Backyards, etc.)
                      </Label>
                      <Badge variant="secondary" className="text-[10px]">
                        {getFilesByType("others").length} photos
                      </Badge>
                    </div>
                    <UploadBox
                      type="others"
                      onUpload={(f) => handleFileUpload(f, "others", true)}
                      onTrigger={() =>
                        setCameraConfig({
                          open: true,
                          type: "others",
                          isMultiple: true,
                        })
                      }
                      onRemove={(id) => removeFile(id)}
                      instruction="Walkway, veranda, store house, garage, etc."
                      multi
                    />
                    <StagingArea
                      files={getFilesByType("others")}
                      onRemove={removeFile}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-red-700">
                      Rejection Warning
                    </h5>
                    <p className="text-xs text-red-600">
                      Images not meeting the specified criteria (blurriness,
                      poor lighting, or missing key areas) will lead to the
                      immediate rejection of your listing application.
                    </p>
                  </div>
                </div>

                {formData.landlord_package === "vantage" &&
                  uploadedFiles.some((f) => f.aiMetadata && !f.aiValidated) && (
                    <div className="mt-2 border-t pt-2">
                      <h6 className="text-[10px] font-bold text-amber-700 uppercase">
                        AI Detected Gaps (Vantage Review)
                      </h6>
                      <ul className="text-[10px] text-amber-600 list-disc list-inside mt-1">
                        {uploadedFiles
                          .filter((f) => f.aiMetadata && !f.aiValidated)
                          .map((f, i) => (
                            <li key={i}>
                              {f.type.replace("_", " ")}: Missing{" "}
                              {f.aiMetadata.missing_objects.join(", ")}
                            </li>
                          ))}
                      </ul>
                      <p className="text-[10px] text-amber-500 italic mt-1 font-medium">
                        Note: These gaps may delay secondary review. Improved
                        captures are recommended.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          {formStep === 0 ? (
            <>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isAddingProperty}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => validateStep0() && setFormStep(1)}
                className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white font-bold shadow-lg shadow-[#9A2A2A]/20 transition-all text-sm"
              >
                Next Step
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setFormStep(0)}
                disabled={isAddingProperty}
                className="text-sm border-slate-200"
              >
                Previous Step
              </Button>
              <Button
                onClick={handleAddProperty}
                disabled={isAddingProperty}
                className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white font-bold shadow-lg shadow-[#9A2A2A]/20 min-w-[150px] transition-all text-sm"
              >
                {isAddingProperty ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  "Submit Property"
                )}
              </Button>
            </>
          )}
        </div>

        <LiveCameraModal
          open={cameraConfig.open}
          onOpenChange={(open) =>
            setCameraConfig((prev) => ({ ...prev, open }))
          }
          onCapture={(file, isValidated, aiMetadata) => {
            if (cameraConfig.type) {
              handleFileUpload(
                file,
                cameraConfig.type,
                cameraConfig.isMultiple,
                undefined,
                isValidated,
                aiMetadata,
              );
            }
          }}
          title={`Capture ${cameraConfig.type
            ?.split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`}
          type={cameraConfig.type}
          packageType={formData.landlord_package as "prime" | "vantage"}
        />
      </DialogContent>
    </Dialog>
  );
};

interface UploadBoxProps {
  type: UploadedFile["type"];
  file?: UploadedFile;
  onUpload: (file: File) => void;
  onTrigger?: () => void;
  onRemove: (id: string) => void;
  instruction?: string;
  multi?: boolean;
}

const UploadBox = ({
  type,
  file,
  onUpload,
  onTrigger,
  onRemove,
  instruction,
  multi,
}: UploadBoxProps) => {
  if (file && !multi) {
    return (
      <div className="border border-[#C9A227]/20 bg-[#C9A227]/5 rounded-xl p-3 flex items-center justify-between animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
            {file.url && type !== "c_of_o" ? (
              <img
                src={file.url}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <File className="h-4 w-4 text-[#C9A227]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs truncate max-w-[150px] text-slate-800">
              {file.file.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {file.uploading
                ? "Uploading..."
                : file.error
                  ? "Error"
                  : "Uploaded \u2713"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-lg"
          onClick={() => onRemove(file.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#C9A227]/40 transition-all duration-200 group bg-slate-50/50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-200 text-[#C9A227]">
          {["c_of_o", "deeds_of_assignment", "building_approval"].includes(type) ? (
            <File className="h-6 w-6" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
        </div>
        <p className="text-sm font-bold text-slate-700 mb-1">
          {["c_of_o", "deeds_of_assignment", "building_approval"].includes(type) ? "Upload Document" : "Capture Live Photo"}
        </p>
        <p className="text-[10px] text-slate-400 mb-4">{instruction}</p>

        <div className="flex flex-wrap justify-center gap-3">
          {onTrigger ? (
            <Button
              onClick={onTrigger}
              className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white font-bold h-10 px-6 shadow-md shadow-[#9A2A2A]/20 rounded-xl transition-all"
            >
              <Camera className="h-4 w-4 mr-2" /> Open Camera
            </Button>
          ) : (
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onUpload(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white font-bold h-10 px-6 shadow-md shadow-[#9A2A2A]/20 rounded-xl transition-all pointer-events-none"
              >
                <Upload className="h-4 w-4 mr-2" /> Choose File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StagingArea = ({
  files,
  onRemove,
}: {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}) => {
  if (files.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-48 overflow-y-auto scrollbar-premium">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative aspect-square bg-white rounded border overflow-hidden group shadow-sm"
        >
          {file.url ? (
            <img
              src={file.url}
              alt="Staged"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {file.uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <ImageIcon className="h-4 w-4 text-gray-300" />
              )}
            </div>
          )}
          <button
            onClick={() => onRemove(file.id)}
            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            title="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          {file.error && (
            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500 shadow-sm" />
            </div>
          )}
        </div>
      ))}
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
  <div className="border border-slate-100 rounded-xl overflow-hidden">
    <div
      className="bg-slate-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={onToggle}
    >
      <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
        <div className="p-1 bg-[#C9A227]/10 rounded-lg">
          <Icon className="h-3.5 w-3.5 text-[#C9A227]" />
        </div>
        {title}
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
  <div className="p-3 bg-[#C9A227]/5 border border-[#C9A227]/10 rounded-xl">
    <h4 className="font-bold text-[#C9A227] text-xs">{title}</h4>
    <p className="text-xs text-slate-600 mt-0.5">{text}</p>
  </div>
);
