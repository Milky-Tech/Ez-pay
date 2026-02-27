"use client";

import React, { useState } from "react";
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
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ZapOff,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { NIGERIAN_STATES_LGAS } from "@/lib/nigerian-states";
import { LiveCameraModal } from "@/app/components/ui/live-camera-modal";
import Link from "next/link";
import { getCurrentLocation } from "@/lib/geolocation";

interface AddPropertyViewProps {
  token: string | null;
  user_id: string;
  onSuccess: () => void;
  onCancel: () => void;
  toast: (props: {
    variant?: "default" | "destructive";
    title?: string;
    description?: string;
  }) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

export default function AddPropertyView({
  token,
  user_id,
  onSuccess,
  onCancel,
  toast,
}: AddPropertyViewProps) {
  const [formStep, setFormStep] = useState(0);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
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
    number_of_units: "1",
    rent: "",
    compound_road: "",
    power_system: "",
    interior_rooms: [] as string[],
    exterior_shot: "",
    landlord_package: "prime",
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
      !formData.landlord_package ||
      !getFileByType("c_of_o")
    ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields and upload the Certificate of Occupancy.",
      });
      return false;
    }
    return true;
  };

  const handleAddProperty = async () => {
    if (!token || !user_id) return;

    const isVantage = formData.landlord_package === "vantage";
    const isPrime = formData.landlord_package === "prime";

    if (!isVantage && !consentGiven) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description: "Please confirm that your property meets the ACCESSS standard",
      });
      return;
    }

    const compoundRoadUrl = getFileByType("compound_road")?.url;
    const powerFiles = getFilesByType("power_system");
    const powerSystemUrl = powerFiles[0]?.url;
    const exteriorShotUrl = getFileByType("exterior_shot")?.url;

    if (isPrime && powerFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Requirement",
        description: "Power System Image is compulsory for Prime package.",
      });
      return;
    }

    const interiorFiles = getInteriorRoomFiles();
    const interiorUrls = interiorFiles.map((f) => f.url).filter(Boolean) as string[];

    if (!compoundRoadUrl || !exteriorShotUrl) {
      toast({
        variant: "destructive",
        title: "Missing Files",
        description: "Please upload required property images (Compound and Exterior Shot)",
      });
      return;
    }

    setIsAddingProperty(true);
    try {
      const interiorFiles = getInteriorRoomFiles().filter(f => f.type !== "c_of_o");
      const interiorUrls = interiorFiles.map((f) => f.url).filter(Boolean) as string[];

      const propertyData = {
        ...formData,
        landlord_id: user_id,
        number_of_units: parseInt(formData.number_of_units) || 1,
        rent: parseInt(formData.rent) || 0,
        compound_road: compoundRoadUrl,
        power_system: powerSystemUrl,
        exterior_shot: exteriorShotUrl,
        lead_image_url: exteriorShotUrl,
        interior_rooms: interiorUrls,
        landlord_package: formData.landlord_package,
        c_of_o: getFileByType("c_of_o")?.url || "",
        locationData: locationData,
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
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add property");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add property. Please try again.";
      toast({
        variant: "destructive",
        title: "Add Property Failed",
        description: errorMessage,
      });
    } finally {
      setIsAddingProperty(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-raleway">Add New Property</h1>
          <p className="text-slate-500">Step {formStep + 1} of 2: {formStep === 0 ? "Property Details" : "Property Imagery"}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-2 bg-slate-100 w-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${(formStep + 1) * 50}%` }}
          />
        </div>

        <div className="p-8 sm:p-12">
          {formStep === 0 ? (
            <div className="space-y-10">
              {/* Package Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Select Listing Package</h3>
                  <p className="text-slate-500 text-sm">Choose the best fitting package for your property.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card 
                    className={`relative cursor-pointer transition-all border-2 overflow-hidden ${
                      formData.landlord_package === "prime" 
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                    onClick={() => setFormData({ ...formData, landlord_package: "prime" })}
                  >
                    {formData.landlord_package === "prime" && (
                      <div className="absolute top-0 right-0 bg-primary text-white p-1 rounded-bl-lg">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${formData.landlord_package === "prime" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">EZPAY PRIME</CardTitle>
                      </div>
                      <CardDescription>Ready-to-go assets. Immediate onboarding.

</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Property meets 100% of <a href="#access-standard">ACCESS Standard criteria</a>
.</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>No modifications or financial leverage needed
</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Fast-tracked listing (7-10 days after inspection)</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`relative cursor-pointer transition-all border-2 overflow-hidden ${
                      formData.landlord_package === "vantage" 
                        ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                    onClick={() => setFormData({ ...formData, landlord_package: "vantage" })}
                  >
                    {formData.landlord_package === "vantage" && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white p-1 rounded-bl-lg">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${formData.landlord_package === "vantage" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                          <ZapOff className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">EZPAY VANTAGE</CardTitle>
                      </div>
                      <CardDescription>Asset requires strategic upgrade. Facilitated secured financing via Capital Legacy Partners.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Meets aesthetic/space standards but fails critical criteria</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Uses CLP facility for mandatory upgrades</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-amber-700 font-medium">
                        <Info className="h-4 w-4" />
                        <span>Property value enhancement for higher rental rates</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end w-full"><Link href={'/landlord-partner'}><Button className="bg-white text-xs text-primary border-b-2 border-primary hover:text-white"><i>Learn More</i></Button></Link></div>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="property_address">Property Address *</Label>
                    <Input
                      id="property_address"
                      value={formData.property_address}
                      onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                      placeholder="e.g. 15, Admiralty Way, Lekki Phase 1"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(v) => setFormData({ ...formData, state: v, area: "" })}
                    >
                      <SelectTrigger className="bg-slate-50 border-none h-11">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(NIGERIAN_STATES_LGAS).map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Local Government (Area) *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(v) => setFormData({ ...formData, area: v })}
                      disabled={!formData.state}
                    >
                      <SelectTrigger className="bg-slate-50 border-none h-11">
                        <SelectValue placeholder={formData.state ? "Select LGA" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.state && NIGERIAN_STATES_LGAS[formData.state]?.map((lga) => (
                          <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="typology">Property Type *</Label>
                    <Select
                      value={formData.typology}
                      onValueChange={(v) => setFormData({ ...formData, typology: v })}
                    >
                      <SelectTrigger className="bg-slate-50 border-none h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom", "5 Bedroom", "Duplex", "Self Contain", "Studio"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent (₦) *</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      placeholder="e.g. 150000"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                </div>
              </div>

              {formData.landlord_package === "prime" && (
                <div className="space-y-6" id="access-standard">
                  <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-raleway">The ACCESSS Standard</CardTitle>
                      </div>
                      <p className="text-slate-600 text-sm">
                        Prime listings must meet these quality benchmarks for House Serenity.
                      </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                      <div className="p-4 bg-white rounded-xl border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Wrench className="h-4 w-4" />
                          <span className="font-bold text-sm">Aesthetics</span>
                        </div>
                        <p className="text-xs text-slate-500">Newly painted with premium finish & high-grade tiles.</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Zap className="h-4 w-4" />
                          <span className="font-bold text-sm">Power Systems</span>
                        </div>
                        <p className="text-xs text-slate-500">Guaranteed nighttime supply. Inverters/Solar preferred.</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Thermometer className="h-4 w-4" />
                          <span className="font-bold text-sm">Comfort</span>
                        </div>
                        <p className="text-xs text-slate-500">Mandatory split unit A/Cs in all major areas.</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Droplets className="h-4 w-4" />
                          <span className="font-bold text-sm">Compound</span>
                        </div>
                        <p className="text-xs text-slate-500">Paved access roads & secured perimeter fence.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-start space-x-3 p-6 border rounded-2xl bg-slate-50">
                    <Checkbox
                      id="consent"
                      checked={consentGiven}
                      onCheckedChange={(c) => setConsentGiven(!!c)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consent" className="text-sm font-bold text-slate-900">
                        Compliance Confirmation
                      </Label>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        I confirm my property and images sincerely meet ACCESSS standards. I understand that misrepresentation will lead to immediate rejection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <File className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900">Property Documents</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-bold">Certificate of Occupancy (C of O) *</Label>
                    <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Required</Badge>
                  </div>
                  <UploadBox
                    type="c_of_o"
                    file={getFileByType("c_of_o")}
                    onUpload={(f) => handleFileUpload(f, "c_of_o")}
                    onTrigger={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.jpg,.jpeg,.png";
                      input.onchange = (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const file = target.files?.[0];
                        if (file) handleFileUpload(file, "c_of_o");
                      };
                      input.click();
                    }}
                    onRemove={(id) => removeFile(id)}
                    instruction="Upload a scanned copy or clear photo of the C of O."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  onClick={() => validateStep0() && setFormStep(1)}
                  className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold gap-2"
                >
                  Continue to Imagery <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-8">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900">Required Property Imagery</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Exterior Shot Image *</Label>
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Main Photo</Badge>
                    </div>
                    <UploadBox
                      type="exterior_shot"
                      file={getFileByType("exterior_shot")}
                      onUpload={(f) => handleFileUpload(f, "exterior_shot")}
                      onTrigger={() => setCameraConfig({ open: true, type: "exterior_shot", isMultiple: false })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Full view of the building exterior in daylight."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Compound/Road Image *</Label>
                      <Badge variant="outline" className="text-[10px]">Required</Badge>
                    </div>
                    <UploadBox
                      type="compound_road"
                      file={getFileByType("compound_road")}
                      onUpload={(f) => handleFileUpload(f, "compound_road")}
                      onTrigger={() => setCameraConfig({ open: true, type: "compound_road", isMultiple: false })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Show clear view of the access road and entrance."
                    />
                  </div>

                  <div className={`space-y-3 md:col-span-2 ${formData.landlord_package === "prime" ? "p-6 border border-amber-200 bg-amber-50/50 rounded-2xl" : ""}`}>
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">
                        Power System Image {formData.landlord_package === "prime" && "*"}
                      </Label>
                      <div className="flex gap-2">
                        {formData.landlord_package === "prime" && (
                          <Badge className="bg-amber-500 text-[10px] border-none">Compulsory for Prime</Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px]">{getFilesByType("power_system").length} photos</Badge>
                      </div>
                    </div>
                    <UploadBox
                      type="power_system"
                      onUpload={(f) => handleFileUpload(f, "power_system", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "power_system", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Show the generator, inverter, or solar setup."
                      multi
                    />
                    <StagingArea files={getFilesByType("power_system")} onRemove={removeFile} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Home className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900">Interior Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Living Room</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("living_room").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="living_room"
                      onUpload={(f) => handleFileUpload(f, "living_room", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "living_room", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Capture main living space from multiple angles."
                      multi
                    />
                    <StagingArea files={getFilesByType("living_room")} onRemove={removeFile} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Bedrooms</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("bedroom").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="bedroom"
                      onUpload={(f) => handleFileUpload(f, "bedroom", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "bedroom", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Show each bedroom clearly including closets."
                      multi
                    />
                    <StagingArea files={getFilesByType("bedroom")} onRemove={removeFile} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Kitchen</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("kitchen").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="kitchen"
                      onUpload={(f) => handleFileUpload(f, "kitchen", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "kitchen", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Focus on cabinets, sink, and workspace."
                      multi
                    />
                    <StagingArea files={getFilesByType("kitchen")} onRemove={removeFile} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Rest Rooms</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("rest_room").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="rest_room"
                      onUpload={(f) => handleFileUpload(f, "rest_room", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "rest_room", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Capture toilets, showers, and tiling."
                      multi
                    />
                    <StagingArea files={getFilesByType("rest_room")} onRemove={removeFile} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Others (Balconies, Backyards, etc.)</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("others").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="others"
                      onUpload={(f) => handleFileUpload(f, "others", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "others", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Any other important features of the property."
                      multi
                    />
                    <StagingArea files={getFilesByType("others")} onRemove={removeFile} />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button variant="outline" onClick={() => setFormStep(0)} className="h-12 px-8 rounded-xl font-medium border-slate-200">
                  Back to Details
                </Button>
                <Button 
                  onClick={handleAddProperty}
                  disabled={isAddingProperty}
                  className="bg-primary hover:bg-primary/90 h-12 px-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  {isAddingProperty ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Submit Property"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LiveCameraModal
        open={cameraConfig.open}
        onOpenChange={(open) => setCameraConfig((prev) => ({ ...prev, open }))}
        onCapture={async (file, isValidated, aiMetadata) => {
          if (cameraConfig.type) {
            const interiorTypes = ["living_room", "bedroom", "kitchen", "rest_room", "others"];
            if (interiorTypes.includes(cameraConfig.type) && !locationData) {
              try {
                const loc = await getCurrentLocation();
                setLocationData(loc);
                toast({
                  title: "Location Captured",
                  description: "Property location has been automatically recorded.",
                });
              } catch (error) {
                console.error("Failed to fetch location", error);
              }
            }
            handleFileUpload(file, cameraConfig.type, cameraConfig.isMultiple, undefined, isValidated, aiMetadata);
          }
        }}
        title={`Capture ${cameraConfig.type?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`}
        type={cameraConfig.type}
        packageType={formData.landlord_package as "prime" | "vantage"}
      />
    </div>
  );
}

interface UploadBoxProps {
  type: UploadedFile["type"];
  file?: UploadedFile;
  onUpload: (file: File) => void;
  onTrigger?: () => void;
  onRemove: (id: string) => void;
  instruction: string;
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
      <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-xl border flex items-center justify-center overflow-hidden shadow-sm">
            {file.url && type !== "c_of_o" ? (
              <img
                src={file.url}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <File className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]">
              {file.file.name}
            </p>
            <p className="text-xs text-slate-500">
              {file.uploading
                ? "Uploading..."
                : file.error
                  ? "Error"
                  : "Uploaded Successfully"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50"
          onClick={() => onRemove(file.id)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-primary/50 transition-all group bg-slate-50/50 hover:bg-primary/5">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary border border-slate-100">
          {type === "c_of_o" ? (
            <File className="h-8 w-8" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
        </div>
        <p className="font-bold text-slate-900 mb-1">
          {type === "c_of_o" ? "Upload Document" : "Capture Photo"}
        </p>
        <p className="text-xs text-slate-500 mb-6 max-w-[200px]">{instruction}</p>
        {onTrigger && (
          <Button
            onClick={onTrigger}
            className="bg-white text-primary border-primary border-2 hover:bg-primary hover:text-white h-11 px-8 rounded-xl font-bold transition-all shadow-sm"
          >
            {type === "c_of_o" ? (
              <>
                <Upload className="h-4 w-4 mr-2" /> Choose File
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" /> Open Camera
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

interface StagingAreaProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

const StagingArea = ({ files, onRemove }: StagingAreaProps) => {
  if (files.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-64 overflow-y-auto">
      {files.map((file: UploadedFile) => (
        <div
          key={file.id}
          className="relative aspect-square bg-white rounded-xl border border-slate-100 overflow-hidden group shadow-sm transition-transform hover:scale-95"
        >
          {file.url ? (
            <img
              src={file.url}
              alt="Staged"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              {file.uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <ImageIcon className="h-5 w-5 text-slate-300" />
              )}
            </div>
          )}
          <button
            onClick={() => onRemove(file.id)}
            className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
