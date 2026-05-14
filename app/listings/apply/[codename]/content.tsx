"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  User,
  Briefcase,
  FileText,
  AlertCircle,
  Upload,
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAuth } from "@/context/authcontext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RentalApplicationPage() {
  const { codename } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuth();
  const { handleFileUpload } = useFileUpload(token);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentAddress: "",
    currentLandlordName: "",
    currentLandlordContact: "",
    reasonForLeaving: "",
    durationOfStay: "",
    companyName: "",
    jobTitle: "",
    monthlyIncome: "",
    hrContact: "",
    desiredStartDate: "",
    paymentPlan: "ez_anchor",
    emergencyContactName: "",
    emergencyContactPhone: "",
    guarantorName: "",
    guarantorPhone: "",
    guarantorEmail: "",
    guarantorIdNumber: "",
    guarantorWorkplace: "",
  });

  const [files, setFiles] = useState<{
    bankStatement: string | null;
    govtId: string | null;
    livePhoto: string | null;
    guarantorId: string | null;
    attestationLetter: string | null;
  }>({
    bankStatement: null,
    govtId: null,
    livePhoto: null,
    guarantorId: null,
    attestationLetter: null,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/listings/${codename}`);
        if (response.ok) {
          const data = await response.json();
          setProperty(data.data || data);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [codename]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({ title: "Uploading...", description: "Please wait while we process your document." });
      const result = await handleFileUpload(file, "others");
      if (result) {
        setFiles((prev) => ({ ...prev, [type]: result }));
        toast({ title: "Upload Successful", description: "Document uploaded correctly." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload document." });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const applicationData = {
        listing_id: property?.unique_id || property?.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        current_address: formData.currentAddress,
        current_landlord_name: formData.currentLandlordName,
        current_landlord_contact: formData.currentLandlordContact,
        reason_for_leaving: formData.reasonForLeaving,
        duration_of_stay: formData.durationOfStay,
        company_name: formData.companyName,
        job_title: formData.jobTitle,
        monthly_income: parseFloat(formData.monthlyIncome.replace(/,/g, "")),
        hr_contact: formData.hrContact,
        desired_start_date: formData.desiredStartDate,
        payment_plan: formData.paymentPlan,
        tenant_package: property?.landlord_package || "prime",
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        bank_statement_path: files.bankStatement,
        government_id_path: files.govtId,
        live_photo_path: files.livePhoto,
        guarantor_name: formData.paymentPlan === "ez_ascend" ? formData.guarantorName : undefined,
        guarantor_phone: formData.paymentPlan === "ez_ascend" ? formData.guarantorPhone : undefined,
        guarantor_email: formData.paymentPlan === "ez_ascend" ? formData.guarantorEmail : undefined,
        guarantor_id_number: formData.paymentPlan === "ez_ascend" ? formData.guarantorIdNumber : undefined,
        guarantor_workplace: formData.paymentPlan === "ez_ascend" ? formData.guarantorWorkplace : undefined,
        guarantor_id_path: formData.paymentPlan === "ez_ascend" ? files.guarantorId : undefined,
        attestation_letter_path: formData.paymentPlan === "ez_ascend" ? files.attestationLetter : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        toast({
          title: "Application Submitted",
          description: "Your application has been received. We will get back to you shortly.",
        });
        router.push("/listings");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B2323]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <div className="h-2 w-full bg-gray-100">
            <div 
              className="h-full bg-[#8B2323] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <CardHeader className="bg-white pb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-[#8B2323]/10 flex items-center justify-center text-[#8B2323]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold font-raleway">Apply for {property?.typology}</CardTitle>
                <CardDescription>{property?.area}, {property?.state}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <User className="h-5 w-5 text-[#8B2323]" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+234..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Residential Address</Label>
                    <Input name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <Briefcase className="h-5 w-5 text-[#8B2323]" /> Employment & Income
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company/Employer Name</Label>
                    <Input name="companyName" value={formData.companyName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Net Income (₦)</Label>
                    <Input name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} placeholder="500,000" />
                  </div>
                  <div className="space-y-2">
                    <Label>HR Contact (Email/Phone)</Label>
                    <Input name="hrContact" value={formData.hrContact} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5 text-[#8B2323]" /> Document Uploads
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label>6 Months Bank Statement (PDF)</Label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#8B2323]/50 transition-all group">
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => onFileChange(e, "bankStatement")} />
                      {files.bankStatement ? <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" /> : <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2 group-hover:text-[#8B2323]" />}
                      <p className="text-sm font-medium">{files.bankStatement ? "File Uploaded" : "Click or drag to upload"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Government Issued ID</Label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#8B2323]/50 transition-all group">
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => onFileChange(e, "govtId")} />
                      {files.govtId ? <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" /> : <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2 group-hover:text-[#8B2323]" />}
                      <p className="text-sm font-medium">{files.govtId ? "File Uploaded" : "Click or drag to upload"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <AlertCircle className="h-5 w-5 text-[#8B2323]" /> Final Review
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    By submitting this application, you agree that EZ-PAY may perform vetting and credit checks based on the information provided.
                  </p>
                  <div className="flex items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="h-4 w-4 rounded bg-[#8B2323]" />
                    <span className="text-sm font-medium">I attest that all information provided is accurate and true.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="rounded-full px-8"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              
              {currentStep < totalSteps - 1 ? (
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-[#8B2323] hover:bg-[#721c1c] text-white rounded-full px-8"
                >
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#8B2323] hover:bg-[#721c1c] text-white rounded-full px-8"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
