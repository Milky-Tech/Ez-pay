// 'use client';

// import { useState } from 'react';
// import { useParams } from 'next/navigation';
// import Header from '@/components/header';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Progress } from '@/components/ui/progress';
// import { Upload } from 'lucide-react';

// export default function RentalApplicationPage() {
//   const params = useParams();
//   const [currentStep, setCurrentStep] = useState(0);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     currentAddress: '',
//     currentLandlordName: '',
//     currentLandlordContact: '',
//     reasonForLeaving: '',
//     durationOfStay: '',
//     companyName: '',
//     hrContact: '',
//     desiredStartDate: '',
//     paymentPlan: 'ez_anchor' as 'ez_anchor' | 'ez_ascend',
//   });

//   const totalSteps = 4;
//   const progress = ((currentStep + 1) / totalSteps) * 100;

//   const handleNext = () => {
//     if (currentStep < totalSteps - 1) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     alert('Application submitted successfully! You will receive an email confirmation shortly. Our team will review your application within 2 weeks.');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <div className="pt-24 pb-12">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-primary mb-4 font-raleway">
//               Rental Application
//             </h1>
//             <p className="text-lg text-gray-600">
//               Property Code: {params.codename}
//             </p>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle className="font-raleway text-2xl">Application Form</CardTitle>
//               <Progress value={progress} className="mt-4" />
//               <p className="text-sm text-gray-600 mt-2">Step {currentStep + 1} of {totalSteps}</p>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit}>
//                 {currentStep === 0 && (
//                   <div className="space-y-4">
//                     <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Bio & Current Residency</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="fullName">Full Name *</Label>
//                         <Input
//                           id="fullName"
//                           value={formData.fullName}
//                           onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="currentAddress">Current Residential Address *</Label>
//                         <Textarea
//                           id="currentAddress"
//                           value={formData.currentAddress}
//                           onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="currentLandlordName">Current Landlord's Full Name *</Label>
//                           <Input
//                             id="currentLandlordName"
//                             value={formData.currentLandlordName}
//                             onChange={(e) => setFormData({ ...formData, currentLandlordName: e.target.value })}
//                             required
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="currentLandlordContact">Landlord's Contact *</Label>
//                           <Input
//                             id="currentLandlordContact"
//                             value={formData.currentLandlordContact}
//                             onChange={(e) => setFormData({ ...formData, currentLandlordContact: e.target.value })}
//                             required
//                           />
//                         </div>
//                       </div>
//                       <div>
//                         <Label htmlFor="reasonForLeaving">Reason for Leaving *</Label>
//                         <Textarea
//                           id="reasonForLeaving"
//                           value={formData.reasonForLeaving}
//                           onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="durationOfStay">Duration of Stay at Current Residence *</Label>
//                         <Input
//                           id="durationOfStay"
//                           placeholder="e.g., 2 years"
//                           value={formData.durationOfStay}
//                           onChange={(e) => setFormData({ ...formData, durationOfStay: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 1 && (
//                   <div className="space-y-4">
//                     <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Financial & Employment</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="companyName">Company/Business Name *</Label>
//                         <Input
//                           id="companyName"
//                           value={formData.companyName}
//                           onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="hrContact">HR/Owner Contact *</Label>
//                         <Input
//                           id="hrContact"
//                           placeholder="Email or Phone"
//                           value={formData.hrContact}
//                           onChange={(e) => setFormData({ ...formData, hrContact: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//                         <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                         <Label htmlFor="bankStatements" className="block text-center">
//                           <span className="text-primary font-semibold">Upload Last 6 Months Bank Statements</span> *
//                         </Label>
//                         <Input id="bankStatements" type="file" multiple className="mt-2" required />
//                       </div>
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//                         <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                         <Label htmlFor="workId" className="block text-center">
//                           <span className="text-primary font-semibold">Work ID/Business ID/CAC</span> *
//                         </Label>
//                         <Input id="workId" type="file" className="mt-2" required />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 2 && (
//                   <div className="space-y-4">
//                     <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Identification & Security</h3>
//                     <div className="space-y-4">
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//                         <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                         <Label htmlFor="govtId" className="block text-center">
//                           <span className="text-primary font-semibold">Government-Issued ID</span> *
//                         </Label>
//                         <Input id="govtId" type="file" accept="image/*,.pdf" className="mt-2" required />
//                       </div>
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                         <p className="text-sm text-gray-700 font-semibold mb-2">Live Photo & Video Verification</p>
//                         <p className="text-sm text-gray-600">
//                           For identity verification, you will need to take a live photo and record a 5-second video.
//                           This helps us prevent fraud and ensure the security of all parties.
//                         </p>
//                       </div>
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//                         <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                         <Label htmlFor="livePhoto" className="block text-center">
//                           <span className="text-primary font-semibold">Live Photo</span> *
//                         </Label>
//                         <Input id="livePhoto" type="file" accept="image/*" capture="user" className="mt-2" required />
//                       </div>
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//                         <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                         <Label htmlFor="liveVideo" className="block text-center">
//                           <span className="text-primary font-semibold">5-Second Video</span> *
//                         </Label>
//                         <Input id="liveVideo" type="file" accept="video/*" capture="user" className="mt-2" required />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 3 && (
//                   <div className="space-y-4">
//                     <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Terms & Preferences</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="desiredStartDate">Desired Lease Start Date *</Label>
//                         <Input
//                           id="desiredStartDate"
//                           type="date"
//                           value={formData.desiredStartDate}
//                           onChange={(e) => setFormData({ ...formData, desiredStartDate: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-4">
//                         <p className="text-sm text-gray-700">
//                           <strong>Minimum Stay:</strong> 4 months (as per EZ-Pay terms)
//                         </p>
//                       </div>
//                       <div>
//                         <Label className="mb-3 block">Payment Plan Preference *</Label>
//                         <RadioGroup value={formData.paymentPlan} onValueChange={(value: any) => setFormData({ ...formData, paymentPlan: value })}>
//                           <div className="flex items-start space-x-2 border rounded-lg p-4">
//                             <RadioGroupItem value="ez_anchor" id="ez_anchor" className="mt-1" />
//                             <Label htmlFor="ez_anchor" className="flex-1 cursor-pointer">
//                               <div>
//                                 <p className="font-semibold text-primary">EZ-Anchor</p>
//                                 <p className="text-sm text-gray-600">
//                                   Fixed monthly rate throughout your stay. Predictable and stable.
//                                 </p>
//                               </div>
//                             </Label>
//                           </div>
//                           <div className="flex items-start space-x-2 border rounded-lg p-4">
//                             <RadioGroupItem value="ez_ascend" id="ez_ascend" className="mt-1" />
//                             <Label htmlFor="ez_ascend" className="flex-1 cursor-pointer">
//                               <div>
//                                 <p className="font-semibold text-primary">EZ-Ascend</p>
//                                 <p className="text-sm text-gray-600">
//                                   Lower initial rate with gradual increase. Easier start for your finances.
//                                 </p>
//                               </div>
//                             </Label>
//                           </div>
//                         </RadioGroup>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex justify-between mt-8">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={handlePrevious}
//                     disabled={currentStep === 0}
//                     className="font-montserrat"
//                   >
//                     Previous
//                   </Button>
//                   {currentStep < totalSteps - 1 ? (
//                     <Button type="button" onClick={handleNext} className="bg-primary font-montserrat">
//                       Next
//                     </Button>
//                   ) : (
//                     <Button type="submit" className="bg-primary font-montserrat">
//                       Submit Application & Initiate Vetting
//                     </Button>
//                   )}
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import ChatWidget from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Calendar,
  Home,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

// Demo properties data
const DEMO_PROPERTIES = [
  {
    id: "1",
    code_name: "PREMIUM-001",
    typology: "4-Bedroom Luxury Villa",
    area: "Ikoyi",
    state: "Lagos",
    monthly_cost: 8500000,
  },
  {
    id: "2",
    code_name: "PREMIUM-002",
    typology: "3-Bedroom Penthouse",
    area: "Victoria Island",
    state: "Lagos",
    monthly_cost: 5200000,
  },
  {
    id: "3",
    code_name: "PREMIUM-003",
    typology: "5-Bedroom Duplex",
    area: "Maitama",
    state: "Abuja",
    monthly_cost: 9500000,
  },
  {
    id: "4",
    code_name: "PREMIUM-004",
    typology: "4-Bedroom Detached House",
    area: "GRA Phase 2",
    state: "Port Harcourt",
    monthly_cost: 6800000,
  },
  {
    id: "5",
    code_name: "PREMIUM-005",
    typology: "3-Bedroom Apartment",
    area: "Lekki",
    state: "Lagos",
    monthly_cost: 4200000,
  },
  {
    id: "6",
    code_name: "PREMIUM-006",
    typology: "6-Bedroom Mansion",
    area: "Asokoro",
    state: "Abuja",
    monthly_cost: 12500000,
  },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  currentAddress: string;
  currentLandlordName: string;
  currentLandlordContact: string;
  reasonForLeaving: string;
  durationOfStay: string;
  companyName: string;
  jobTitle: string;
  monthlyIncome: string;
  hrContact: string;
  desiredStartDate: string;
  paymentPlan: "ez_anchor" | "ez_ascend";
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const stepTitles = [
  "Personal Information",
  "Current Residency",
  "Employment & Income",
  "Identification",
  "Terms & Review",
];

export default function RentalApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [property, setProperty] = useState<(typeof DEMO_PROPERTIES)[0] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
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
  });

  const totalSteps = stepTitles.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Load property data - runs only on client side
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === "undefined") return;

    const loadProperty = () => {
      try {
        const codename = params?.codename as string;

        // If no codename in params, use a default
        const foundProperty =
          DEMO_PROPERTIES.find(
            (p) => p.code_name === codename || p.id === codename
          ) || DEMO_PROPERTIES[0]; // Default to first property

        setProperty(foundProperty);
      } catch (error) {
        console.error("Error loading property:", error);
        setProperty(DEMO_PROPERTIES[0]);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to simulate loading
    const timer = setTimeout(loadProperty, 100);
    return () => clearTimeout(timer);
  }, [params]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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

    try {
      // Simulate API call
      console.log("Application submitted:", { property, formData });

      // Show success message
      alert(
        `Application submitted successfully for ${property?.typology}!\n\nYou will receive an email confirmation shortly. Our team will review your application within 24-48 hours.`
      );

      // Reset form and redirect
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
      });

      // Redirect to listings page
      setTimeout(() => {
        router.push("/listings");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(
        "There was an error submitting your application. Please try again."
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use a default property if none is found
  const currentProperty = property || DEMO_PROPERTIES[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href={`/listings/${currentProperty.code_name}`}
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
                          {currentProperty.typology}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {currentProperty.area}, {currentProperty.state}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Code: {currentProperty.code_name}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="text-2xl font-bold text-primary font-raleway">
                          {formatPrice(currentProperty.monthly_cost)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        EZ-Pay monthly rate
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
                    {currentProperty.typology}
                  </CardDescription>
                  <div className="mt-4">
                    <Progress value={progress} className="h-2" />
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
                    {/* Step 1: Personal Information */}
                    {currentStep === 0 && (
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

                    {/* Step 2: Current Residency */}
                    {currentStep === 1 && (
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

                    {/* Step 3: Employment & Income */}
                    {currentStep === 2 && (
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
                                currentProperty.monthly_cost ? (
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
                              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              <Label
                                htmlFor="bankStatements"
                                className="block text-center"
                              >
                                <span className="text-primary font-semibold">
                                  Upload 3-6 Months Bank Statements
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
                                className="mt-3"
                                onChange={(e) =>
                                  console.log("Files selected:", e.target.files)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Identification */}
                    {currentStep === 3 && (
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
                              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              <Label
                                htmlFor="govtId"
                                className="block text-center"
                              >
                                <span className="text-primary font-semibold">
                                  Government Issued ID
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
                                className="mt-3"
                                onChange={(e) =>
                                  console.log(
                                    "ID file selected:",
                                    e.target.files
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 font-semibold mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Live Verification Required
                            </p>
                            <p className="text-sm text-gray-600">
                              For security purposes, please take a live photo
                              and record a short video using your device camera.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                              <div className="text-center">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                <Label
                                  htmlFor="livePhoto"
                                  className="block text-center"
                                >
                                  <span className="text-primary font-semibold">
                                    Live Selfie Photo
                                  </span>{" "}
                                  *
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">
                                  Take a clear photo
                                </p>
                                <Input
                                  id="livePhoto"
                                  type="file"
                                  accept="image/*"
                                  className="mt-3"
                                  onChange={(e) =>
                                    console.log(
                                      "Photo selected:",
                                      e.target.files
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                              <div className="text-center">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                <Label
                                  htmlFor="liveVideo"
                                  className="block text-center"
                                >
                                  <span className="text-primary font-semibold">
                                    Short Verification Video
                                  </span>{" "}
                                  *
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">
                                  5-10 seconds saying your name
                                </p>
                                <Input
                                  id="liveVideo"
                                  type="file"
                                  accept="video/*"
                                  className="mt-3"
                                  onChange={(e) =>
                                    console.log(
                                      "Video selected:",
                                      e.target.files
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Terms & Review */}
                    {currentStep === 4 && (
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
                              as per EZ-Pay terms. Early termination fees apply.
                            </p>
                          </div>

                          <div>
                            <Label className="mb-3 block text-lg font-semibold">
                              Select Payment Plan *
                            </Label>
                            <RadioGroup
                              value={formData.paymentPlan}
                              onValueChange={(
                                value: "ez_anchor" | "ez_ascend"
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
                                        <p className="font-bold text-primary text-lg">
                                          EZ-Anchor
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Fixed monthly rate throughout your
                                          stay. Predictable and stable payments.
                                        </p>
                                        <div className="mt-2">
                                          <p className="font-semibold text-primary">
                                            {formatPrice(
                                              currentProperty.monthly_cost
                                            )}{" "}
                                            / month
                                          </p>
                                        </div>
                                      </div>
                                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        Most Popular
                                      </span>
                                    </div>
                                  </Label>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors mt-3">
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
                                    <div>
                                      <p className="font-bold text-primary text-lg">
                                        EZ-Ascend
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Graduated payment plan with lower
                                        initial payments that increase over
                                        time.
                                      </p>
                                      <div className="mt-2">
                                        <p className="font-semibold text-primary">
                                          Starting from{" "}
                                          {formatPrice(
                                            currentProperty.monthly_cost * 0.8
                                          )}{" "}
                                          / month
                                        </p>
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="bg-secondary/10 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Application Summary
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Property:</span>
                                <span className="font-medium">
                                  {currentProperty.typology}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium">
                                  {currentProperty.area},{" "}
                                  {currentProperty.state}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Selected Plan:
                                </span>
                                <span className="font-medium">
                                  {formData.paymentPlan === "ez_anchor"
                                    ? "EZ-Anchor (Fixed)"
                                    : "EZ-Ascend (Graduated)"}
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
                        disabled={currentStep === 0}
                        className="font-montserrat"
                      >
                        Back
                      </Button>
                      <div className="flex items-center space-x-3">
                        {currentStep < totalSteps - 1 ? (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="bg-primary font-montserrat px-8"
                          >
                            Continue
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            className="bg-secondary font-montserrat px-8"
                          >
                            Submit Application
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
    </div>
  );
}
