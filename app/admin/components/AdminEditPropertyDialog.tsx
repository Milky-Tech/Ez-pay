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
import {
  Building2,
  MapPin,
  Info,
  ImageIcon,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Shield,
  Loader2,
  Save,
  Home,
  File,
  Sparkles,
  X,
} from "lucide-react";
import AdminImageManager from "./AdminImageManager";
import { useAuth } from "@/context/authcontext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/app/components/ui/badge";

import { Property } from "@/app/types/property";

interface AdminEditPropertyDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const STEPS = [
  { title: "Basic Info", short: "Basics", icon: Home },
  { title: "Financials", short: "Finance", icon: CreditCard },
  { title: "Legal Docs", short: "Legal", icon: Shield },
  { title: "Media", short: "Media", icon: ImageIcon },
  { title: "Review", short: "Review", icon: CheckCircle },
];

export default function AdminEditPropertyDialog({
  property,
  isOpen,
  onClose,
  onSuccess,
}: AdminEditPropertyDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [formStep, setFormStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(4);
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
      setFormStep(0);
    }
  }, [property]);

  useEffect(() => {
    if (formData.rent !== undefined) {
      const rent = Number(formData.rent) || 0;
      if (rent > 0) {
        const calculatedMonthlyRent =
          Math.ceil(((rent + rent / 5 + 2000000) / 12) / 1000) * 1000;
        setFormData((prev) => {
          if (prev.monthly_rent === calculatedMonthlyRent) return prev;
          const newCautionFee =
            Math.ceil((calculatedMonthlyRent * 3) / 1000) * 1000;
          return {
            ...prev,
            monthly_rent: calculatedMonthlyRent,
            caution_fee: newCautionFee,
          };
        });
      }
    }
  }, [formData.rent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goToStep = (step: number) => {
    setFormStep(step);
    if (step > maxStepReached) setMaxStepReached(step);
  };

  const handleSave = async () => {
    if (!property?.id || !token) return;
    setIsSaving(true);
    try {
      const patchData = { ...formData };
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
        description: `${property.code_name || `#${property.id}`} updated successfully.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
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

  const inputClass =
    "bg-slate-50/80 border border-slate-200/80 focus-visible:ring-[#9A2A2A]/30 focus-visible:border-[#9A2A2A]/50 transition-all placeholder:text-slate-400";
  const labelClass = "text-xs font-semibold text-slate-600 uppercase tracking-wider";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden p-0 gap-0 rounded-2xl border-slate-200/60 shadow-2xl shadow-black/10">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a0a] p-6 pb-5">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_70%_50%,#C9A227,transparent_60%)]" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-5 bg-[#9A2A2A] rounded-full" />
                <span className="text-[10px] text-[#C9A227] uppercase tracking-[0.2em] font-bold">
                  Admin · Edit Listing
                </span>
              </div>
              <h2 className="text-xl font-black text-white font-raleway">
                {property.code_name || `Property #${property.id}`}
              </h2>
              <p className="text-xs text-white/40 mt-1">
                Step {formStep + 1} of {STEPS.length} — {STEPS[formStep].title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <Badge className="bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/30 animate-pulse text-[10px]">
                  <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                  Saving
                </Badge>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Step Navigator */}
          <div className="flex items-center gap-1 mt-5 overflow-x-auto no-scrollbar pb-1">
            {STEPS.map((step, index) => {
              const isCompleted = index < formStep;
              const isCurrent = index === formStep;
              const isLocked = index > maxStepReached;
              const Icon = step.icon;
              return (
                <button
                  key={index}
                  disabled={isLocked}
                  onClick={() => !isLocked && goToStep(index)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#9A2A2A] text-white shadow-lg shadow-[#9A2A2A]/20"
                      : isCompleted
                      ? "bg-white/10 text-white hover:bg-white/15"
                      : isLocked
                      ? "text-white/20 cursor-not-allowed"
                      : "text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-3 w-3 text-[#C9A227]" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.short}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#9A2A2A] to-[#c44444] transition-all duration-700 ease-out rounded-full"
              style={{ width: `${((formStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(92vh-280px)] scrollbar-premium p-6">
          {/* Step 0: Basic Info */}
          {formStep === 0 && (
            <div className="space-y-6 animate-fade-in-up">
              <SectionHeader icon={Info} title="Basic Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Typology</Label>
                  <Input name="typology" value={formData.typology || ""} onChange={handleChange} placeholder="e.g. 2 Bedroom" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Listing Status</Label>
                  <Select value={formData.listing_status || "available"} onValueChange={(v) => handleSelectChange("listing_status", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                      <SelectItem value="upgrade_pending">Upgrade Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Bedrooms</Label>
                    <Input name="bedrooms" type="number" value={formData.bedrooms ?? ""} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Bathrooms</Label>
                    <Input name="bathrooms" type="number" value={formData.bathrooms ?? ""} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Parking</Label>
                    <Input name="parking_space" type="number" value={formData.parking_space ?? ""} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Landlord Package</Label>
                  <Select value={formData.landlord_package || "prime"} onValueChange={(v) => handleSelectChange("landlord_package", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prime">Prime</SelectItem>
                      <SelectItem value="vantage">Vantage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Financials */}
          {formStep === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <SectionHeader icon={CreditCard} title="Pricing & Financing" />
              <div className="p-4 rounded-xl bg-[#C9A227]/5 border border-[#C9A227]/15">
                <p className="text-xs text-[#C9A227] font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Monthly Rent and Caution Fee are auto-calculated from Annual Rent
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { id: "rent", label: "Annual Rent (Base) ₦" },
                  { id: "monthly_rent", label: "Monthly Rent ₦" },
                  { id: "caution_fee", label: "Caution Fee ₦" },
                  { id: "payback_amount", label: "Payback Amount ₦" },
                  { id: "upgrade_loan", label: "Upgrade Loan ₦" },
                  { id: "amortization_period", label: "Amortization (Months)" },
                  { id: "inspection_fee", label: "Inspection Fee ₦" },
                  { id: "tenant_package", label: "Tenant Package", type: "text" },
                ].map(({ id, label, type = "number" }) => (
                  <div key={id} className="space-y-1.5">
                    <Label className={labelClass}>{label}</Label>
                    <Input name={id} type={type} value={(formData as any)[id] ?? ""} onChange={handleChange} className={inputClass} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Legal Docs */}
          {formStep === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <SectionHeader icon={Shield} title="Legal Document Paths" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminImageManager
                  label="Certificate of Occupancy (C of O)"
                  value={formData.c_of_o || ""}
                  type="c_of_o"
                  token={token}
                  accept=".pdf,image/*"
                  onChange={(url) => setFormData((prev) => ({ ...prev, c_of_o: url as string }))}
                />
                <AdminImageManager
                  label="Deeds of Assignment"
                  value={formData.deeds_of_assignment || ""}
                  type="deeds_of_assignment"
                  token={token}
                  accept=".pdf,image/*"
                  onChange={(url) => setFormData((prev) => ({ ...prev, deeds_of_assignment: url as string }))}
                />
                <div className="md:col-span-2">
                  <AdminImageManager
                    label="Building Approval"
                    value={formData.building_approval || ""}
                    type="building_approval"
                    token={token}
                    accept=".pdf,image/*"
                    onChange={(url) => setFormData((prev) => ({ ...prev, building_approval: url as string }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {formStep === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <SectionHeader icon={ImageIcon} title="Property Gallery" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminImageManager
                  label="Exterior Shot *"
                  value={formData.exterior_shot || ""}
                  type="exterior_shot"
                  token={token}
                  onChange={(url) => setFormData((prev) => ({ ...prev, exterior_shot: url as string }))}
                />
                <AdminImageManager
                  label="Compound / Road *"
                  value={formData.compound_road || ""}
                  type="compound_road"
                  token={token}
                  onChange={(url) => setFormData((prev) => ({ ...prev, compound_road: url as string }))}
                />
                <div className="md:col-span-2">
                  <AdminImageManager
                    label="Power System *"
                    value={formData.power_system || ""}
                    type="power_system"
                    token={token}
                    onChange={(url) => setFormData((prev) => ({ ...prev, power_system: url as string }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <AdminImageManager
                    label="Interior Rooms & Spaces *"
                    value={formData.interior_rooms || []}
                    type="interior_rooms"
                    isMultiple={true}
                    token={token}
                    onChange={(urls) => setFormData((prev) => ({ ...prev, interior_rooms: urls }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {formStep === 4 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#9A2A2A] to-[#6b1d1d] flex items-center justify-center shadow-lg shadow-[#9A2A2A]/20">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-raleway">Review Changes</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Please review all modifications before committing to the live listing.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReviewCard
                  title="Basic Details"
                  items={[
                    { label: "Type", value: formData.typology || "N/A" },
                    { label: "Status", value: formData.listing_status || "N/A" },
                    { label: "Beds/Baths/Park", value: `${formData.bedrooms || 0} / ${formData.bathrooms || 0} / ${formData.parking_space || 0}` },
                    { label: "Package", value: formData.landlord_package || "N/A" },
                  ]}
                />
                <ReviewCard
                  title="Pricing"
                  accent
                  items={[
                    { label: "Annual Rent", value: `₦${Number(formData.rent || 0).toLocaleString()}` },
                    { label: "Monthly Rent", value: `₦${Number(formData.monthly_rent || 0).toLocaleString()}` },
                    { label: "Caution Fee", value: `₦${Number(formData.caution_fee || 0).toLocaleString()}` },
                    { label: "Inspection Fee", value: `₦${Number(formData.inspection_fee || 0).toLocaleString()}` },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSaving} className="text-slate-500 hover:text-slate-700 text-sm">
              Cancel
            </Button>
            {formStep > 0 && (
              <Button variant="outline" onClick={() => setFormStep(formStep - 1)} disabled={isSaving} className="text-sm border-slate-200">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
          </div>
          <div>
            {formStep < STEPS.length - 1 ? (
              <Button
                onClick={() => goToStep(formStep + 1)}
                className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white font-bold shadow-lg shadow-[#9A2A2A]/20 transition-all text-sm"
              >
                Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white font-bold shadow-lg shadow-[#9A2A2A]/20 transition-all text-sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Commit Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Sub-components ── */

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="p-2 bg-[#9A2A2A]/10 rounded-xl">
        <Icon className="h-4 w-4 text-[#9A2A2A]" />
      </div>
      <h3 className="font-bold text-slate-900 font-raleway">{title}</h3>
    </div>
  );
}

function ReviewCard({
  title,
  items,
  accent = false,
}: {
  title: string;
  items: { label: string; value: string }[];
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 space-y-2 ${accent ? "bg-[#C9A227]/5 border border-[#C9A227]/15" : "bg-slate-50 border border-slate-100"}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${accent ? "text-[#C9A227]" : "text-slate-400"}`}>{title}</p>
      {items.map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-xs text-slate-500">{label}</span>
          <span className={`text-xs font-bold ${accent ? "text-[#C9A227]" : "text-slate-800"}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}
