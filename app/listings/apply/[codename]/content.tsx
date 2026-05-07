"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Header from "@/app/components/header";
import ChatWidget from "@/app/components/ui/chat-widget";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Progress } from "@/app/components/ui/progress";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Upload,
  FileText,
  Calendar,
  Home,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Camera,
  Video,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import { useFileUpload } from "@/hooks/useFileUpload";
import { LiveCameraModal } from "@/app/components/ui/live-camera-modal";
import { LiveVideoModal } from "@/app/components/ui/live-video-modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RentalApplicationContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { token, user, isAuthenticated } = useAuth();
  const { handleFileUpload, getFileByType, getFilesByType, uploadedFiles } =
    useFileUpload(token);

  const [property, setProperty] = useState<any>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [videoCameraOpen, setVideoCameraOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
    paymentPlan: "ez_anchor" as "ez_anchor" | "ez_ascend",
    emergencyContactName: "",
    emergencyContactPhone: "",
    guarantorName: "",
    guarantorPhone: "",
    guarantorEmail: "",
    guarantorIdNumber: "",
    guarantorWorkplace: "",
  });

  // Calculate steps dynamically based on package
  const baseSteps = [
    "Select Package",
    "Personal Information",
    "Current Residency",
    "Employment & Income",
    "Identification",
    "Terms & Review",
  ];

  const stepTitles = formData.paymentPlan === "ez_ascend" 
    ? [...baseSteps.slice(0, 5), "Guarantor Information", ...baseSteps.slice(5)]
    : baseSteps;

  const propertyCode = params?.codename as string;

  useEffect(() => {
    const fetchListing = async () => {
      if (!propertyCode) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/listings/${propertyCode}`,
        );
        if (!response.ok) throw new Error("Listing not found");
        const data = await response.json();
        const prop = data.data || data;
        setProperty(prop);

        // Auto-fill some data if user is logged in
        if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.full_name || prev.fullName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load property details.",
        });
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchListing();
  }, [propertyCode, user, toast]);

  // No authentication required - public form

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalSteps = stepTitles.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!property) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Property details not loaded.",
      });
      return;
    }

    // No authentication required - public form

    // Get file URLs
    const bankStatements = getFilesByType("bank_statements")
      .map((f) => f.url)
      .filter(Boolean);
    const govtIdUrl = getFileByType("govt_id")?.url;
    const livePhotoUrl = getFileByType("live_photo")?.url;
    const liveVideoUrl = getFileByType("live_video")?.url;
    
    // Guarantor files
    const guarantorIdUrl = getFileByType("guarantor_id")?.url;
    const attestationLetterUrl = getFileByType("attestation_letter")?.url;

    // Validate required files
    if (
      bankStatements.length === 0 ||
      !govtIdUrl ||
      !livePhotoUrl ||
      !liveVideoUrl
    ) {
      toast({
        variant: "destructive",
        title: "Missing Files",
        description:
          "Please ensure all required documents, live captures, and verification video are uploaded.",
      });
      return;
    }

    // Validate Guarantor for Ascend
    if (formData.paymentPlan === "ez_ascend") {
      if (
        !formData.guarantorName ||
        !formData.guarantorPhone ||
        !formData.guarantorEmail ||
        !formData.guarantorIdNumber ||
        !formData.guarantorWorkplace ||
        !guarantorIdUrl ||
        !attestationLetterUrl
      ) {
        toast({
          variant: "destructive",
          title: "Missing Guarantor Information",
          description:
            "EZPAY Ascend requires complete guarantor details and documents (ID & Attestation Letter).",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payloadPaymentPlan =
        formData.paymentPlan === "ez_anchor"
          ? "anchor"
          : formData.paymentPlan === "ez_ascend"
            ? "ascend"
            : formData.paymentPlan;

      const applicationData = {
        listing_id: property.id,
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
        monthly_income: formData.monthlyIncome,
        hr_contact: formData.hrContact,
        desired_start_date: formData.desiredStartDate,
        payment_plan: payloadPaymentPlan,
        tenant_package: payloadPaymentPlan,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        bank_statement_path: bankStatements[0], // Using the first statement as required singular field
        government_id_path: govtIdUrl,
        live_photo_path: livePhotoUrl,
        verification_video_path: liveVideoUrl,
        // Guarantor Data (only if ascend)
        guarantor_name: formData.paymentPlan === "ez_ascend" ? formData.guarantorName : undefined,
        guarantor_phone: formData.paymentPlan === "ez_ascend" ? formData.guarantorPhone : undefined,
        guarantor_email: formData.paymentPlan === "ez_ascend" ? formData.guarantorEmail : undefined,
        guarantor_id_number: formData.paymentPlan === "ez_ascend" ? formData.guarantorIdNumber : undefined,
        guarantor_workplace: formData.paymentPlan === "ez_ascend" ? formData.guarantorWorkplace : undefined,
        guarantor_id_path: formData.paymentPlan === "ez_ascend" ? guarantorIdUrl : undefined,
        attestation_letter_path: formData.paymentPlan === "ez_ascend" ? attestationLetterUrl : undefined,
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
          description: `Your application for ${property.typology} has been submitted successfully.`,
        });

        // Reset form
        setCurrentStep(0);
        setFormData({
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

        // Redirect to listings or dashboard
        router.push("/listings");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
        <p className="text-gray-600 mt-2">
          The property you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/listings")} className="mt-6">
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />
      <section className="relative h-[45vh] flex pt-auto justify-center bg-[#000000] bg-transparent-[60%]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/aboutUs.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] lg:max-w-1/3 mx-auto my-auto flex pt-6">
          <div className="px-6 md:px-12 text-center m-auto">
            <h1 className="text-5xl font-bold text-white mb-2 font-raleway">
              {property.typology}<br/> <span className="text-primary text-2xl">{property.area}, {property.state}</span>
            </h1>
            </div>
        </div>
      </section>
      <div className="pt-12 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href={`/listings/${propertyCode}`}
              className="text-primary hover:underline font-montserrat flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <Home className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-bold text-lg text-primary font-raleway">
                          {property.typology}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {property.area}, {property.state}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Code: {property.code_name}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="text-2xl font-bold text-primary font-raleway">
                          {formatPrice(
                            formData.paymentPlan === "ez_anchor"
                              ? (property.monthly_rent || (property.rent * 1.1 / 12))
                              : (property.monthly_rent || ((property.rent - (property.rent * 1.1 * 4 / 12)) / 11))
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formData.paymentPlan === "ez_anchor" ? "Standard monthly rate" : "Ascend graduated rate"}
                      </p>
                    </div>

                    <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-secondary" />
                        Application Checklist
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {stepTitles.map((title, index) => (
                          <li key={index} className="flex items-center">
                            <span
                              className={`h-2 w-2 rounded-full mr-2 ${
                                index <= currentStep
                                  ? "bg-secondary"
                                  : "bg-gray-300"
                              }`}
                            ></span>
                            {title}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Your application will be reviewed within 24-48 hours.
                        Ensure all information is accurate.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-raleway text-2xl md:text-3xl text-primary">
                    Rental Application Form
                  </CardTitle>
                  <CardDescription>
                    Complete all {totalSteps} steps to apply for{" "}
                    {property.typology}
                  </CardDescription>
                  <div className="mt-4">
                    {/* <Progress value={progress} className="h-2" /> */}
                    <div className="flex justify-between mt-2">
                      <p className="text-sm font-medium text-primary">
                        Step {currentStep + 1}: {stepTitles[currentStep]}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentStep + 1} of {totalSteps}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Select Package */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Select Your Package
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="mb-3 block text-lg font-semibold">
                                  Choose a Payment Plan *
                                </Label>
                                <RadioGroup
                                  value={formData.paymentPlan}
                                  onValueChange={(
                                    value: "ez_anchor" | "ez_ascend",
                                  ) =>
                                    setFormData({ ...formData, paymentPlan: value })
                                  }
                                >
                                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors">
                                    <RadioGroupItem
                                      value="ez_anchor"
                                      id="ez_anchor"
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor="ez_anchor"
                                        className="cursor-pointer"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-primary text-lg">
                                                EZPAY ANCHOR
                                              </p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                              3 months rent as refundable caution fee.
                                              <br/>
                                              No guarantor required.
                                              <br/>
                                              <span className="text-xs text-gray-500 italic block mt-1">First payment: {formatPrice((property.monthly_rent || (property.rent * 1.1 / 12)) * 4)} (1st Mo + 3 Mo Caution)</span>
                                            </p>
                                            <div className="mt-2">
                                              <p className="font-semibold text-primary">
                                                {formatPrice(
                                                  property.monthly_rent ||
                                                    (property.rent * 1.1 / 12)
                                                )}{" "}
                                                / month
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </Label>
                                    </div>
                                  </div>
    
                                  <div className="mt-4 flex items-start space-x-3 border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors">
                                    <RadioGroupItem
                                      value="ez_ascend"
                                      id="ez_ascend"
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor="ez_ascend"
                                        className="cursor-pointer"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-primary text-lg">
                                                EZPAY ASCEND
                                              </p>
                                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                Graduated Payments
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                              Zero caution fee.
                                              <br/>
                                              Requires a verified Guarantor.
                                              <br/>
                                              Financed by Capital Legacy Partner.
                                            </p>
                                            <div className="mt-2">
                                              <p className="font-semibold text-primary">
                                                {formatPrice(
                                                  property.monthly_rent ||
                                                  ((property.rent - (property.rent * 1.1 * 4 / 12)) / 11),
                                                )}{" "}
                                                / month
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </Label>
                                    </div>
                                  </div>
                                </RadioGroup>
    
                                {/* Package Details Info Box */}
                                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Package Comparison
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-bold text-blue-900 mb-1">EZPAY ANCHOR</p>
                                      <ul className="list-disc list-inside text-blue-800 space-y-1">
                                        <li>3 months rent as refundable caution fee</li>
                                        <li><strong>First time payment: Rent * 4</strong></li>
                                        <li>Standard monthly payments</li>
                                        <li><strong>No guarantor required</strong></li>
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-bold text-blue-900 mb-1">EZPAY ASCEND</p>
                                      <ul className="list-disc list-inside text-blue-800 space-y-1">
                                        <li><strong>Zero caution fee</strong></li>
                                        <li>1st month rent payment to start</li>
                                        <li>Graduated monthly payments</li>
                                        <li><strong>Compulsory Guarantor</strong> (Min 6 months)</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fullName">Full Name *</Label>
                              <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                  })
                                }
                                placeholder="John Doe"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="john@example.com"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+234 800 000 0000"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="emergencyContactName">
                                Emergency Contact Name *
                              </Label>
                              <Input
                                id="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    emergencyContactName: e.target.value,
                                  })
                                }
                                placeholder="Jane Smith"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="emergencyContactPhone">
                                Emergency Contact Phone *
                              </Label>
                              <Input
                                id="emergencyContactPhone"
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    emergencyContactPhone: e.target.value,
                                  })
                                }
                                placeholder="+234 800 000 0000"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Current Residency */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Current Residency Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="currentAddress">
                              Current Residential Address *
                            </Label>
                            <Textarea
                              id="currentAddress"
                              value={formData.currentAddress}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  currentAddress: e.target.value,
                                })
                              }
                              placeholder="Full address including city and state"
                              rows={3}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="durationOfStay">
                              How long have you lived here? *
                            </Label>
                            <Input
                              id="durationOfStay"
                              placeholder="e.g., 2 years 3 months"
                              value={formData.durationOfStay}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  durationOfStay: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="currentLandlordName">
                                Current Landlord&apos;s Name *
                              </Label>
                              <Input
                                id="currentLandlordName"
                                value={formData.currentLandlordName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    currentLandlordName: e.target.value,
                                  })
                                }
                                placeholder="Landlord's full name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="currentLandlordContact">
                                Landlord&apos;s Contact *
                              </Label>
                              <Input
                                id="currentLandlordContact"
                                value={formData.currentLandlordContact}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    currentLandlordContact: e.target.value,
                                  })
                                }
                                placeholder="Phone or email"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="reasonForLeaving">
                              Reason for Leaving Current Residence *
                            </Label>
                            <Textarea
                              id="reasonForLeaving"
                              value={formData.reasonForLeaving}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  reasonForLeaving: e.target.value,
                                })
                              }
                              placeholder="Please provide details"
                              rows={2}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Employment & Income */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Employment & Financial Information
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="companyName">
                                Company/Business Name *
                              </Label>
                              <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    companyName: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="jobTitle">
                                Job Title/Position *
                              </Label>
                              <Input
                                id="jobTitle"
                                value={formData.jobTitle}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    jobTitle: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="monthlyIncome">
                              Monthly Income (NGN) *
                            </Label>
                            <Input
                              id="monthlyIncome"
                              type="number"
                              value={formData.monthlyIncome}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  monthlyIncome: e.target.value,
                                })
                              }
                              placeholder="e.g., 2000000"
                              required
                            />
                            {formData.monthlyIncome && (
                              <p className="text-sm text-gray-600 mt-1">
                                {parseInt(formData.monthlyIncome) >=
                                (property.monthly_cost || property.rent) ? (
                                  <span className="text-green-600">
                                    ✓ Income meets requirement
                                  </span>
                                ) : (
                                  <span className="text-amber-600">
                                    ⚠ Income below recommended amount
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="hrContact">
                              HR/Supervisor Contact *
                            </Label>
                            <Input
                              id="hrContact"
                              placeholder="Email or phone for verification"
                              value={formData.hrContact}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  hrContact: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              {getFileByType("bank_statements")?.uploading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                              ) : (
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              )}
                              <Label
                                htmlFor="bankStatements"
                                className="block text-center cursor-pointer"
                              >
                                <span className="text-primary font-semibold">
                                  {getFilesByType("bank_statements").length > 0
                                    ? `Uploaded ${getFilesByType("bank_statements").length} Statements`
                                    : "Upload 6 Months Bank Statements"}
                                </span>{" "}
                                *
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                PDF or images accepted
                              </p>
                              <Input
                                id="bankStatements"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(
                                    e.target.files || [],
                                  );
                                  files.forEach((file) =>
                                    handleFileUpload(
                                      file,
                                      "bank_statements",
                                      true,
                                    ),
                                  );
                                }}
                              />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {getFilesByType("bank_statements").map((f, i) => (
                                <div
                                  key={i}
                                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center"
                                >
                                  Statement {i + 1}
                                  {f.url && (
                                    <CheckCircle className="ml-1 h-3 w-3" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Identification */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Identification & Verification
                        </h3>
                        <div className="space-y-4">
                          <Alert>
                            <FileText className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              All documents are encrypted and stored securely.
                              Required for identity verification.
                            </AlertDescription>
                          </Alert>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              {getFileByType("govt_id")?.uploading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                              ) : (
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              )}
                              <Label
                                htmlFor="govtId"
                                className="block text-center cursor-pointer"
                              >
                                <span className="text-primary font-semibold">
                                  {getFileByType("govt_id")?.url
                                    ? "ID Document Uploaded"
                                    : "Government Issued ID"}
                                </span>{" "}
                                *
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                International Passport, Driver&apos;s License,
                                or National ID
                              </p>
                              <Input
                                id="govtId"
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "govt_id");
                                }}
                              />
                              {getFileByType("govt_id")?.url && (
                                <div className="mt-2 text-green-600 flex items-center justify-center text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" /> File
                                  ready
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 font-semibold mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Live Verification Required
                            </p>
                            <p className="text-sm text-gray-600">
                              For security purposes, please take a live photo
                              using your device camera.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                              <div className="text-center">
                                {getFileByType("live_photo")?.uploading ? (
                                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                                ) : (
                                  <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full text-primary font-semibold hover:bg-primary/5"
                                  onClick={() => setCameraOpen(true)}
                                >
                                  {getFileByType("live_photo")?.url
                                    ? "Retake Live Photo"
                                    : "Take Live Selfie Photo"}{" "}
                                  *
                                </Button>
                                <p className="text-sm text-gray-500 mt-1">
                                  Capture real-time image
                                </p>
                                {getFileByType("live_photo")?.url && (
                                  <div className="mt-2 text-green-600 flex items-center justify-center text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                    Captured successfully
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                              <div className="text-center">
                                {getFileByType("live_video")?.uploading ? (
                                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                                ) : (
                                  <Video className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full text-primary font-semibold hover:bg-primary/5"
                                  onClick={() => setVideoCameraOpen(true)}
                                >
                                  {getFileByType("live_video")?.url
                                    ? "Retake Verification Video"
                                    : "Record Verification Video"}{" "}
                                  *
                                </Button>
                                <p className="text-sm text-gray-500 mt-1">
                                  10 second live recording
                                </p>
                                {getFileByType("live_video")?.url && (
                                  <div className="mt-2 text-green-600 flex items-center justify-center text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                    Recorded successfully
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Guarantor Information (Only for Anchor) */}
                    {currentStep === 5 && formData.paymentPlan === "ez_anchor" && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Guarantor Information
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-blue-800">
                            <strong>EZPAY Anchor Requirement:</strong> Since this package involves no caution fee, a verified guarantor is required. Please provide accurate details.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="guarantorName">Guarantor Full Name *</Label>
                              <Input
                                id="guarantorName"
                                value={formData.guarantorName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    guarantorName: e.target.value,
                                  })
                                }
                                placeholder="Enter guarantor's full name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="guarantorPhone">Guarantor Phone Number *</Label>
                              <Input
                                id="guarantorPhone"
                                type="tel"
                                value={formData.guarantorPhone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    guarantorPhone: e.target.value,
                                  })
                                }
                                placeholder="+234 800 000 0000"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="guarantorEmail">Guarantor Email Address *</Label>
                              <Input
                                id="guarantorEmail"
                                type="email"
                                value={formData.guarantorEmail}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    guarantorEmail: e.target.value,
                                  })
                                }
                                placeholder="guarantor@example.com"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="guarantorIdNumber">Guarantor ID Number *</Label>
                              <Input
                                id="guarantorIdNumber"
                                value={formData.guarantorIdNumber}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    guarantorIdNumber: e.target.value,
                                  })
                                }
                                placeholder="NIN, Voter's Card, or Passport Number"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="guarantorWorkplace">Place of Work or Business *</Label>
                            <Input
                              id="guarantorWorkplace"
                              value={formData.guarantorWorkplace}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  guarantorWorkplace: e.target.value,
                                })
                              }
                              placeholder="Company name and address"
                              required
                            />
                          </div>

                          {/* Guarantor ID Upload */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              {getFileByType("guarantor_id")?.uploading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                              ) : (
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              )}
                              <Label
                                htmlFor="guarantorId"
                                className="block text-center cursor-pointer"
                              >
                                <span className="text-primary font-semibold">
                                  {getFileByType("guarantor_id")?.url
                                    ? "Guarantor ID Uploaded"
                                    : "Upload Guarantor's ID (Image)"}
                                </span>{" "}
                                *
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                Clear image of valid ID (National ID, Drivers License, Passport)
                              </p>
                              <Input
                                id="guarantorId"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "guarantor_id");
                                }}
                              />
                              {getFileByType("guarantor_id")?.url && (
                                <p className="text-xs text-green-600 mt-2 flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  File uploaded successfully
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Attestation Letter Upload */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              {getFileByType("attestation_letter")?.uploading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                              ) : (
                                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              )}
                              <Label
                                htmlFor="attestationLetter"
                                className="block text-center cursor-pointer"
                              >
                                <span className="text-primary font-semibold">
                                  {getFileByType("attestation_letter")?.url
                                    ? "Attestation Letter Uploaded"
                                    : "Upload Attestation Letter"}
                                </span>{" "}
                                *
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                Signed letter from guarantor attesting to their role
                              </p>
                              <Input
                                id="attestationLetter"
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "attestation_letter");
                                }}
                              />
                              {getFileByType("attestation_letter")?.url && (
                                <p className="text-xs text-green-600 mt-2 flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  File uploaded successfully
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6/7: Final Review & Terms */}
                    {((currentStep === 5 && formData.paymentPlan !== "ez_anchor") || (currentStep === 6 && formData.paymentPlan === "ez_anchor")) && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary font-montserrat">
                          Final Review & Terms
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="desiredStartDate"
                              className="flex items-center"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Desired Move-in Date *
                            </Label>
                            <Input
                              id="desiredStartDate"
                              type="date"
                              value={formData.desiredStartDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  desiredStartDate: e.target.value,
                                })
                              }
                              min={new Date().toISOString().split("T")[0]}
                              required
                            />
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Minimum Stay Requirement
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>4 months minimum stay</strong> is required
                              as per EZPAY terms. Early termination fees apply.
                            </p>
                          </div>



                          <div className="bg-secondary/10 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Application Summary
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Property:</span>
                                <span className="font-medium">
                                  {property.typology}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium">
                                  {property.area}, {property.state}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Selected Plan:
                                </span>
                                <span className="font-medium">
                                  {formData.paymentPlan === "ez_anchor"
                                    ? "EZPAY ANCHOR (Fixed)"
                                    : "EZPAY ASCEND (Graduated)"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Applicant:
                                </span>
                                <span className="font-medium">
                                  {formData.fullName || "Not provided"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                              <input
                                type="checkbox"
                                id="terms"
                                required
                                className="h-4 w-4 mt-1"
                              />
                              <Label
                                htmlFor="terms"
                                className="text-sm cursor-pointer"
                              >
                                I agree to the Terms of Service and Privacy
                                Policy. I confirm all information provided is
                                accurate and complete to the best of my
                                knowledge.
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0 || isSubmitting}
                        className="font-montserrat"
                      >
                        Back
                      </Button>
                      <div className="flex items-center space-x-3">
                        {currentStep < totalSteps - 1 ? (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="bg-primary hover:bg-primary/90 font-montserrat px-8"
                          >
                            Continue
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-secondary hover:bg-secondary/90 font-montserrat px-8"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Application"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <LiveCameraModal
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(file) => handleFileUpload(file, "live_photo")}
        title="Identity Verification Selfie"
        type="live_photo"
        disableAI={true}
      />

      <LiveVideoModal
        open={videoCameraOpen}
        onOpenChange={setVideoCameraOpen}
        onCapture={(file) => handleFileUpload(file, "live_video")}
        title="Live Verification Video"
        maxDuration={10}
      />
    </div>
  );
}
