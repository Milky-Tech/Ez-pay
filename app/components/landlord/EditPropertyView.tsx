"use client";

import React, { useState, useEffect } from "react";
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
import { useGeolocation } from "@/hooks/useGeolocation";

interface EditPropertyViewProps {
  token: string | null;
  user_id: string;
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
  toast: (props: {
    variant?: "default" | "destructive";
    title?: string;
    description?: string;
  }) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditPropertyView({
  token,
  user_id,
  propertyId,
  onSuccess,
  onCancel,
  toast,
}: EditPropertyViewProps) {
  const [formStep, setFormStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(4); // drafts being edited can access any step usually, but we can set to 4 or track it
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    aesthetics: false,
    power: false,
    comfort: false,
    compound: false,
  });

  const { position, getPosition, error: geoError } = useGeolocation();

  // Reverse geocoding when position is captured
  useEffect(() => {
    const reverseGeocode = async () => {
      if (position && position?.lat && position?.lng) {
        try {
          // Store raw position
          setLocationData({
            lat: position.lat,
            long: position.lng,
            latitude: position.lat,
            longitude: position.lng
          });

          // Perform reverse geocoding to fill form (only if empty)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.lat}&longitude=${position.lng}`
          );
          const data = await response.json();

          if (data) {
            const newState = data.localityInfo?.administrative?.find(
              (a: any) => a.adminLevel <= 4 && NIGERIAN_STATES_LGAS[a.name]
            )?.name || data.principalSubdivision;

            const newArea = data.locality || data.city || data.localityInfo?.administrative?.find(
              (a: any) => a.adminLevel > 4
            )?.name;

            const newAddress = data.localityInfo?.administrative?.[0]?.name || data.label || "";

            setFormData(prev => ({
              ...prev,
              state: prev.state || newState || "",
              area: prev.area || newArea || "",
              property_address: prev.property_address || newAddress || ""
            }));

            toast({
              title: "Location Updated",
              description: `Property location verified: ${newState || "Unknown State"}`,
            });
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }
      }
    };
    reverseGeocode();
  }, [position]);

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
    handleFileUpload: originalHandleFileUpload,
    handleBulkInteriorUpload,
    removeFile,
    clearUploads,
    getFileByType,
    getFilesByType,
    getInteriorRoomFiles,
  } = useFileUpload(token);

  const handleFileUpload = async (file: File, type: string, isMultiple?: boolean, ...args: any[]) => {
    const interiorTypes = ["living_room", "bedroom", "kitchen", "rest_room", "others"];
    if (interiorTypes.includes(type) && !locationData) {
      getPosition();
    }
    return originalHandleFileUpload(file, type as UploadedFile["type"], isMultiple, ...args);
  };

  // Fetch initial draft data
  useEffect(() => {
    let isMounted = true;
    const fetchDraft = async () => {
      try {
        let property = null;

        // 1. Try to load from Local Storage first
        const storedDraftStr = typeof window !== "undefined" ? localStorage.getItem(`draft_${propertyId}`) : null;
        if (storedDraftStr) {
          try {
            property = JSON.parse(storedDraftStr);
            console.log("Loaded draft from local storage");
          } catch (e) {
            console.error("Failed to parse stored draft", e);
          }
        }

        // 2. No API fallback allowed as per requirement
        if (!property) {
          console.warn("Property draft not found in local storage", propertyId);
        }

        if (property && isMounted) {
            setFormData({
              property_address: property.property_address || "",
              state: property.state || "",
              area: property.area || "",
              typology: property.typology || "",
              rent: property.rent?.toString() || "",
              bedrooms: property.bedrooms?.toString() || "",
              bathrooms: property.bathrooms?.toString() || "",
              parking_space: property.parking_space?.toString() || "",
              compound_road: property.compound_road || "",
              power_system: property.power_system || "",
              interior_rooms: property.interior_rooms || [],
              exterior_shot: property.exterior_shot || "",
              landlord_package: property.landlord_package || "prime",
              deeds_of_assignment: property.deeds_of_assignment || "",
              building_approval: property.building_approval || "",
              c_of_o: property.c_of_o || "",
            });
            setLocationData(property.locationData || property.location_data || null);
            setConsentGiven(true);
        } else if (isMounted) {
            console.error("Property not found or failed to load", propertyId);
            toast({
              variant: "destructive",
              title: "Property Not Found",
              description: "Could not load the property details to edit. Please try again from the dashboard.",
            });
        }
      } catch (e) {
        console.error("Failed to fetch draft:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (propertyId && token) {
      fetchDraft();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [propertyId, token]);

  const validateStep0 = () => {
    if (
      !formData.property_address ||
      !formData.state ||
      !formData.area ||
      !formData.typology ||
      !formData.rent ||
      !formData.bedrooms ||
      !formData.bathrooms ||
      !formData.parking_space ||
      !formData.landlord_package ||
      (!getFileByType("c_of_o") && !formData.c_of_o) ||
      (!getFileByType("deeds_of_assignment") && !formData.deeds_of_assignment) ||
      (!getFileByType("building_approval") && !formData.building_approval)
    ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields and upload all mandatory documents (C of O, Deeds of Assignment, and Building Approval).",
      });
      return false;
    }
    return true;
  };

  const handleAction = async (isPublishingAction: boolean) => {
    if (!token || !user_id || !propertyId) return;

    if (isPublishingAction && !validateStep0()) return;

    const isVantage = formData.landlord_package === "vantage";
    const isPrime = formData.landlord_package === "prime";

    if (isPublishingAction && !isVantage && !consentGiven) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description: "Please confirm that your property meets the ACCESSS standard",
      });
      return;
    }

    const compoundRoadUrl = getFileByType("compound_road")?.url || formData.compound_road;
    const powerFiles = getFilesByType("power_system");
    const powerSystemUrl = powerFiles[0]?.url || formData.power_system;
    const exteriorShotUrl = getFileByType("exterior_shot")?.url || formData.exterior_shot;
    const deedsUrl = getFileByType("deeds_of_assignment")?.url || formData.deeds_of_assignment;
    const approvalUrl = getFileByType("building_approval")?.url || formData.building_approval;

    if (isPublishingAction) {
      if (isPrime && !powerSystemUrl) {
        toast({
          variant: "destructive",
          title: "Missing Requirement",
          description: "Power System Image is compulsory for Prime package.",
        });
        return;
      }

      if (!compoundRoadUrl || !exteriorShotUrl || !deedsUrl || !approvalUrl) {
        toast({
          variant: "destructive",
          title: "Missing Files",
          description: "Please upload required property images and documents (Compound, Exterior Shot, Deeds of Assignment, and Building Approval)",
        });
        return;
      }
    }

    if (isPublishingAction) {
           setIsPublishing(true);
    } else {
      setIsAutoSaving(true);
    }

    try {
      // 1. Update/Save Progress (PUT)
      setIsAutoSaving(true); // Ensure it's set during the process
      const currentInteriorFiles = getInteriorRoomFiles().filter(f => f.type !== "c_of_o");
      const newInteriorUrls = currentInteriorFiles.map(f => f.url).filter(Boolean) as string[];
      const allInteriorUrls = Array.from(new Set([...(formData.interior_rooms || []), ...newInteriorUrls]));

      const propertyData = {
        ...formData,
        rent: parseInt(formData.rent) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        parking_space: parseInt(formData.parking_space) || 0,
        compound_road: compoundRoadUrl,
        power_system: powerSystemUrl,
        exterior_shot: exteriorShotUrl,
        lead_image_url: exteriorShotUrl,
        interior_rooms: allInteriorUrls,
        c_of_o: getFileByType("c_of_o")?.url || formData.c_of_o,
        deeds_of_assignment: deedsUrl,
        building_approval: approvalUrl,
        locationData: locationData ? {
          ...locationData,
          city: formData.area || "Unknown",
          state: formData.state || "Unknown",
          address: formData.property_address || "Unknown"
        } : null,
      };

      const updateResponse = await fetch(`${API_BASE_URL}/listings/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        // Update local storage draft too
        if (typeof window !== "undefined") {
            localStorage.setItem(`draft_${propertyId}`, JSON.stringify(result.data || result));
        }
        setLastSaved(new Date());
      }

      if (!updateResponse.ok) {
        throw new Error("Failed to save changes");
      }

      setLastSaved(new Date());

      // 2. Publish if requested
      if (isPublishingAction) {
        const publishResponse = await fetch(`${API_BASE_URL}/listings/${propertyId}/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (publishResponse.ok) {
          toast({
            title: "Property Published",
            description: "Your property has been submitted for review.",
          });
          onSuccess();
        } else {
          const errorData = await publishResponse.json();
          throw new Error(errorData.message || "Failed to publish property");
        }
      } else {
        toast({
          title: "Draft Saved",
          description: "Your changes have been saved successfully.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Action failed. Please try again.";
      toast({
        variant: "destructive",
        title: isPublishingAction ? "Publish Failed" : "Save Failed",
        description: errorMessage,
      });
    } finally {
      setIsPublishing(false);
      setIsAutoSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    const nextStep = formStep + 1;
    await handleAction(false);
    setFormStep(nextStep);
    if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-4 font-medium text-slate-500">Loading draft details...</span>
      </div>
    );
  }

  if (!formData.property_address && !formData.state) {
    return (
      <div className="flex flex-col justify-center items-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
         <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
         </div>
         <h3 className="text-2xl font-bold text-slate-900 mb-2 font-raleway">Property Not Found</h3>
         <p className="text-slate-500 text-center max-w-sm mb-8 px-6">
            We couldn't retrieve the data for this draft. It may have been deleted or the link is invalid.
         </p>
         <Button onClick={onCancel} className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold font-raleway shadow-lg shadow-primary/20">
            <ArrowLeft className="h-4 w-4" /> Go back to Dashboard
         </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 font-raleway">Edit Property Draft</h1>
            {isAutoSaving ? (
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-normal text-xs flex gap-1 items-center">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </Badge>
            ) : lastSaved ? (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-normal text-xs flex gap-1 items-center">
                <CheckCircle className="h-3 w-3" /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            ) : null}
          </div>
          <p className="text-slate-500">Step {formStep + 1} of 5: {
            formStep === 0 ? "Basic Information" : 
            formStep === 1 ? "Property Documents" : 
            formStep === 2 ? "Exterior Imagery" : 
            formStep === 3 ? "Interior Details" : "Review & Publish"
          }</p>
        </div>
      </div>

      <StepNavigator 
        currentStep={formStep} 
        maxStepReached={maxStepReached} 
        onStepClick={(step) => setFormStep(step)} 
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-700 ease-in-out" 
            style={{ width: `${((formStep + 1) / 5) * 100}%` }}
          />
        </div>

        <div className="p-8 sm:p-12">
          {formStep === 0 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               {/* Package Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 font-raleway">Select Listing Package</h3>
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
                      <CardDescription>Ready-to-go assets. Immediate onboarding.</CardDescription>
                    </CardHeader>
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
                      <CardDescription>Asset requires strategic upgrade. Facilitated secured financing.</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900 font-raleway">Basic Information</h3>
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
                    <Label htmlFor="rent">Annual Rent (₦) *</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      placeholder="e.g. 1500000"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Number of Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="e.g. 3"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Number of Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="e.g. 2"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parking_space">Parking Space (Cars) *</Label>
                    <Input
                      id="parking_space"
                      type="number"
                      value={formData.parking_space}
                      onChange={(e) => setFormData({ ...formData, parking_space: e.target.value })}
                      placeholder="e.g. 2"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={isAutoSaving}
                  className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                >
                  {isAutoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save and Continue"} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {formStep === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <File className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900 font-raleway">Property Documents</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold text-slate-700">C of O (Certificate of Occupancy)</Label>
                      <Badge variant="outline" className="text-[10px]">Optional</Badge>
                    </div>
                    <UploadBox
                      type="c_of_o"
                      file={getFileByType("c_of_o") || (formData.c_of_o ? { url: formData.c_of_o, name: "c_of_o", type: "c_of_o" } : undefined)}
                      onUpload={(f) => handleFileUpload(f, "c_of_o")}
                      onTrigger={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf,.jpg,.jpeg,.png";
                        input.onchange = (e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files?.[0]) handleFileUpload(target.files[0], "c_of_o");
                        };
                        input.click();
                      }}
                      onRemove={(id) => removeFile(id)}
                      instruction="Official property title document if available."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold text-slate-700">Deed of Assignment *</Label>
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Required</Badge>
                    </div>
                    <UploadBox
                      type="deeds_of_assignment"
                      file={getFileByType("deeds_of_assignment") || (formData.deeds_of_assignment ? { url: formData.deeds_of_assignment, name: "deeds_of_assignment", type: "deeds_of_assignment" } : undefined)}
                      onUpload={(f) => handleFileUpload(f, "deeds_of_assignment")}
                      onTrigger={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf,.jpg,.jpeg,.png";
                        input.onchange = (e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files?.[0]) handleFileUpload(target.files[0], "deeds_of_assignment");
                        };
                        input.click();
                      }}
                      onRemove={(id) => removeFile(id)}
                      instruction="Mandatory proof of ownership transfer."
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold text-slate-700">Building Approval *</Label>
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Required</Badge>
                    </div>
                    <UploadBox
                      type="building_approval"
                      file={getFileByType("building_approval") || (formData.building_approval ? { url: formData.building_approval, name: "building_approval", type: "building_approval" } : undefined)}
                      onUpload={(f) => handleFileUpload(f, "building_approval")}
                      onTrigger={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf,.jpg,.jpeg,.png";
                        input.onchange = (e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files?.[0]) handleFileUpload(target.files[0], "building_approval");
                        };
                        input.click();
                      }}
                      onRemove={(id) => removeFile(id)}
                      instruction="Mandatory government approved building plan."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => setFormStep(0)} className="h-12 px-8 rounded-xl font-medium">
                  Back
                </Button>
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={isAutoSaving}
                  className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                >
                  {isAutoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save and Continue"} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-8">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900 font-raleway">Exterior Imagery</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Exterior Shot Image *</Label>
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Main Photo</Badge>
                    </div>
                    <UploadBox
                      type="exterior_shot"
                      file={getFileByType("exterior_shot") || (formData.exterior_shot ? { url: formData.exterior_shot, name: "exterior_shot", type: "exterior_shot" } : undefined)}
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
                      file={getFileByType("compound_road") || (formData.compound_road ? { url: formData.compound_road, name: "compound_road", type: "compound_road" } : undefined)}
                      onUpload={(f) => handleFileUpload(f, "compound_road")}
                      onTrigger={() => setCameraConfig({ open: true, type: "compound_road", isMultiple: false })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Show clear view of the access road and entrance."
                    />
                  </div>

                  <div className={`space-y-3 md:col-span-2 ${formData.landlord_package === "prime" ? "p-6 border border-amber-200 bg-amber-50/50 rounded-2xl" : ""}`}>
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Power System Image {formData.landlord_package === "prime" && "*"}</Label>
                      <div className="flex gap-2">
                        {formData.landlord_package === "prime" && <Badge className="bg-amber-500 text-[10px] border-none">Compulsory for Prime</Badge>}
                        <Badge variant="secondary" className="text-[10px]">{getFilesByType("power_system").length} photos</Badge>
                      </div>
                    </div>
                    <UploadBox
                      type="power_system"
                      file={getFileByType("power_system")}
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

              <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => setFormStep(1)} className="h-12 px-8 rounded-xl font-medium">
                  Back
                </Button>
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={isAutoSaving}
                  className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                >
                  {isAutoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save and Continue"} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-8">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-slate-900 font-raleway">Interior Details</h3>
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
                      <Label className="font-bold">Restrooms</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("rest_room").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="rest_room"
                      onUpload={(f) => handleFileUpload(f, "rest_room", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "rest_room", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Show bathrooms, toilets, and tiled areas."
                      multi
                    />
                    <StagingArea files={getFilesByType("rest_room")} onRemove={removeFile} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Other Pictures</Label>
                      <Badge variant="secondary" className="text-[10px]">{getFilesByType("others").length} photos</Badge>
                    </div>
                    <UploadBox
                      type="others"
                      onUpload={(f) => handleFileUpload(f, "others", true)}
                      onTrigger={() => setCameraConfig({ open: true, type: "others", isMultiple: true })}
                      onRemove={(id) => removeFile(id)}
                      instruction="Walkway, veranda, store house, garage, etc."
                      multi
                    />
                    <StagingArea files={getFilesByType("others")} onRemove={removeFile} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => setFormStep(2)} className="h-12 px-8 rounded-xl font-medium">
                  Back
                </Button>
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={isAutoSaving}
                  className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                >
                  {isAutoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save and Continue"} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {formStep === 4 && (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
               <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-raleway">Ready to Publish Changes?</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Please review all your updated details and photos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-none">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase">Basic Details</div>
                    <div className="text-sm font-medium">{formData.typology} in {formData.area}, {formData.state}</div>
                    <div className="text-sm text-slate-600 truncate">{formData.property_address}</div>
                    <div className="text-sm font-bold text-primary">₦{parseInt(formData.rent).toLocaleString()} / year</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-none">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase">Assets Captured</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white">{getInteriorRoomFiles().length} Interior Photos</Badge>
                      <Badge variant="secondary" className="bg-white">{getFilesByType("power_system").length} Power Photos</Badge>
                      {(getFileByType("c_of_o") || formData.c_of_o) && <Badge variant="secondary" className="bg-white">C of O</Badge>}
                      {(getFileByType("deeds_of_assignment") || formData.deeds_of_assignment) && <Badge variant="secondary" className="bg-white">Deeds</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {formData.landlord_package === "prime" && (
                <div className="flex items-start space-x-3 p-6 border rounded-2xl bg-amber-50/30 border-amber-100">
                  <Checkbox
                    id="consent-final-edit"
                    checked={consentGiven}
                    onCheckedChange={(c) => setConsentGiven(!!c)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="consent-final-edit" className="text-sm font-bold text-slate-900">
                      Final Compliance Confirmation
                    </Label>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      I confirm my property and images sincerely meet ACCESSS standards. I understand that misrepresentation will lead to immediate rejection.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button variant="ghost" onClick={() => setFormStep(3)} className="h-12 px-8 rounded-xl font-medium">
                  Back to Imagery
                </Button>
                <div className="flex gap-4 w-full sm:w-auto">
                    <Button 
                        variant="outline"
                        onClick={() => handleAction(false)}
                        disabled={isPublishing || isAutoSaving}
                        className="flex-1 sm:flex-none h-12 px-8 rounded-xl font-bold border-slate-200"
                    >
                        {isAutoSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Save Changes"}
                    </Button>
                    <Button 
                        onClick={() => handleAction(true)}
                        disabled={isPublishing || isAutoSaving}
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 h-12 px-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                        {isPublishing ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Publish Property"}
                    </Button>
                </div>
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
              getPosition();
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

const StepNavigator = ({ currentStep, maxStepReached, onStepClick }: { currentStep: number, maxStepReached: number, onStepClick: (step: number) => void }) => {
  const steps = [
    { title: "Basic Info", icon: Home },
    { title: "Documents", icon: File },
    { title: "Exterior", icon: Camera },
    { title: "Interior", icon: ImageIcon },
    { title: "Review", icon: CheckCircle },
  ];

  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 gap-2 no-scrollbar">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLocked = index > maxStepReached;
        const Icon = step.icon;

        return (
          <button
            key={index}
            disabled={isLocked}
            onClick={() => onStepClick(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all whitespace-nowrap ${
              isCurrent 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : isLocked 
                  ? "text-slate-300 cursor-not-allowed" 
                  : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isCurrent ? "bg-white/20" : isCompleted ? "bg-primary/10 text-primary" : "bg-slate-100"
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">{step.title}</span>
          </button>
        );
      })}
    </div>
  );
};

interface UploadBoxProps {
  type: UploadedFile["type"];
  file?: UploadedFile;
  initialImageUrl?: string;
  onUpload: (file: File) => void;
  onTrigger?: () => void;
  onRemove: (id: string, clearInitial?: any) => void;
  instruction: string;
  multi?: boolean;
}

const UploadBox = ({
  type,
  file,
  initialImageUrl,
  onUpload,
  onTrigger,
  onRemove,
  instruction,
  multi,
}: UploadBoxProps) => {
  if ((file || initialImageUrl) && !multi) {
    const displayUrl = file?.url || initialImageUrl;
    const isSuccess = (file?.url && !file?.uploading && !file?.error) || (!file && !!initialImageUrl);
    const isError = !!file?.error;

    return (
      <div className={`border rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200 ${
        isError ? "border-red-500 bg-red-50" : 
        isSuccess ? "border-emerald-500 bg-emerald-50" : 
        "border-primary/20 bg-primary/5"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 bg-white rounded-xl border flex items-center justify-center overflow-hidden shadow-sm ${
            isError ? "border-red-200" : isSuccess ? "border-emerald-200" : "border-slate-200"
          }`}>
            {displayUrl && type !== "c_of_o" ? (
              <img
                src={displayUrl}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <File className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]">
              {file?.file?.name || "Drafted File"}
            </p>
            <p className={`text-xs ${isError ? "text-red-500 font-medium" : isSuccess ? "text-emerald-500 font-medium" : "text-slate-500"}`}>
              {file?.uploading
                ? "Uploading..."
                : file?.error
                  ? file.error
                  : "Saved Successfully"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50"
          onClick={() => {
            if (file) {
              onRemove(file.id);
            } else if (initialImageUrl) {
              onRemove("", true); // Instruct parent to clear initialImageUrl
            }
          }}
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
          {["c_of_o", "deeds_of_assignment", "building_approval"].includes(type) ? (
            <File className="h-8 w-8" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
        </div>
        <p className="font-bold text-slate-900 mb-1">
          {["c_of_o", "deeds_of_assignment", "building_approval"].includes(type) ? "Upload Document" : "Capture Photo"}
        </p>
        <p className="text-xs text-slate-500 mb-6 max-w-[200px]">{instruction}</p>
        {onTrigger && (
          <Button
            onClick={onTrigger}
            className="bg-white text-primary border-primary border-2 hover:bg-primary hover:text-white h-11 px-8 rounded-xl font-bold transition-all shadow-sm"
          >
            {["c_of_o", "deeds_of_assignment", "building_approval"].includes(type) ? (
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
  initialImageUrls?: string[];
  onRemove: (id: string, urlToRemove?: string) => void;
}

const StagingArea = ({ files, initialImageUrls = [], onRemove }: StagingAreaProps) => {
  if (files.length === 0 && initialImageUrls.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-64 overflow-y-auto">
      {/* Render already saved initial draft images */}
      {initialImageUrls.map((url, index) => {
        return (
          <div
            key={`initial-${index}`}
            className="relative aspect-square bg-emerald-50 rounded-xl border border-emerald-500 overflow-hidden group shadow-sm transition-transform hover:scale-95"
          >
            <img
              src={url}
              alt="Drafted"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onRemove("", url)}
              className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-[8px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Saved
            </div>
          </div>
        );
      })}

      {/* Render newly staging files */}
      {files.map((file: UploadedFile) => {
        const isSuccess = file.url && !file.uploading && !file.error;
        const isError = !!file.error;
        
        return (
          <div
            key={file.id}
            className={`relative aspect-square rounded-xl border overflow-hidden group shadow-sm transition-transform hover:scale-95 ${
              isError ? "border-red-500 bg-red-50" : 
              isSuccess ? "border-emerald-500 bg-emerald-50" : 
              "border-slate-100 bg-white"
            }`}
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
                  <ImageIcon className={`h-5 w-5 ${isError ? "text-red-300" : "text-slate-300"}`} />
                )}
              </div>
            )}
            <button
              onClick={() => onRemove(file.id)}
              className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            {isSuccess && (
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-[8px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Success
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
