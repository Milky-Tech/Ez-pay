"use client";

import { useState } from "react";
import Header from "@/app/components/header";
import ChatWidget from "@/app/components/ui/chat-widget";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  CheckCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Droplets,
  Thermometer,
  Sun,
  Wrench,
  Battery,
  VolumeX,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { NIGERIAN_STATES_LGAS } from "@/lib/nigerian-states";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/context/authcontext";
import Footer from "../components/footer";

// API Base URL
const API_BASE_URL = "https://ez-pay.realestway.com/api";

// File upload endpoint
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload/single`;
const BULK_UPLOAD_ENDPOINT = `${API_BASE_URL}/upload/bulk`;
// Property registration endpoint
const REGISTER_ENDPOINT = `${API_BASE_URL}/property/register`;

// Nigerian states and LGAs removed - now imported from @/lib/nigerian-states.ts

// File type mapping
type FileType = "image" | "document";

// Interface for the form data
interface PropertyFormData {
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  occupation: string;
  nationality: string;
  state_of_origin: string;
  lga_of_origin: string;
  residential_address: string;
  place_of_work: string;
  business_name: string;
  business_address: string;
  property_address: string;
  state: string;
  area: string;
  typology: string;
  no_of_units: number;
  rent: number;
  ownership_doc: string;
  gov_id: string;
  cac_cert: string;
  exterior_shot: string;
  compound_road: string;
  power_system: string;
  interior_rooms: string[];
  landlord_package: string;
}

export default function LandlordPartnerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    aesthetics: false,
    power: false,
    comfort: false,
    compound: false,
    prime: false,
    vantage: false,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    designation: "",
    occupation: "",
    residentialAddress: "",
    nationality: "",
    stateOfOrigin: "",
    lgaOfOrigin: "",
    placeOfWork: "",
    businessName: "",
    businessAddress: "",
    propertyAddress: "",
    state: "",
    area: "",
    numberOfUnits: "",
    typology: "",
    desiredAnnualRent: "",
    landlord_package: "",
  });

  // File states
  const [files, setFiles] = useState<{
    ownershipDoc: File | null;
    govtId: File | null;
    cacCert: File | null;
    exteriorPhoto: File | null;
    roadPhoto: File | null;
    powerPhoto: File | null;
    interiorPhotos: File[];
  }>({
    ownershipDoc: null,
    govtId: null,
    cacCert: null,
    exteriorPhoto: null,
    roadPhoto: null,
    powerPhoto: null,
    interiorPhotos: [],
  });

  const [uploadedPaths, setUploadedPaths] = useState<{
    ownership_doc: string;
    gov_id: string;
    cac_cert: string;
    exterior_shot: string;
    compound_road: string;
    power_system: string;
    interior_rooms: string[];
  }>({
    ownership_doc: "",
    gov_id: "",
    cac_cert: "",
    exterior_shot: "",
    compound_road: "",
    power_system: "",
    interior_rooms: [],
  });

  const [uploading, setUploading] = useState<{
    ownershipDoc: boolean;
    govtId: boolean;
    cacCert: boolean;
    exteriorPhoto: boolean;
    roadPhoto: boolean;
    powerPhoto: boolean;
    interiorPhotos: boolean;
  }>({
    ownershipDoc: false,
    govtId: false,
    cacCert: false,
    exteriorPhoto: false,
    roadPhoto: false,
    powerPhoto: false,
    interiorPhotos: false,
  });

  const { isAuthenticated, user } = useAuth();

  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: "success" | "error";
  } | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("landlord_form_data");
    const savedUploadedPaths = localStorage.getItem("landlord_uploaded_paths");
    const savedStep = localStorage.getItem("landlord_current_step");

    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }
    if (savedUploadedPaths) {
      try {
        setUploadedPaths(JSON.parse(savedUploadedPaths));
      } catch (e) {
        console.error("Error parsing saved uploaded paths", e);
      }
    }
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Save data to localStorage on changes
  useEffect(() => {
    localStorage.setItem("landlord_form_data", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(
      "landlord_uploaded_paths",
      JSON.stringify(uploadedPaths)
    );
  }, [uploadedPaths]);

  useEffect(() => {
    localStorage.setItem("landlord_current_step", currentStep.toString());
  }, [currentStep]);

  const totalSteps = 4;

  const showToast = (
    title: string,
    description: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage({ title, description, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  const scrollToForm = () => {
    const formElement = document.getElementById("registration-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // File upload function
  const uploadFile = async (file: File, type: FileType): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Upload failed: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Adjust based on your actual API response structure
      return (
        data.path ||
        data.url ||
        data.filePath ||
        `/storage/uploads/${type === "image" ? "images" : "documents"}/${
          file.name
        }`
      );
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Bulk file upload function
  const uploadBulkFiles = async (
    files: File[],
    type: FileType
  ): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files[]", file);
    });
    formData.append("type", type);

    try {
      const response = await fetch(BULK_UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Bulk upload failed: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Expected response: { urls: ["url1", "url2", ...] } or { paths: [...] }
      return data.urls || data.paths || data.filePaths || [];
    } catch (error) {
      console.error("Bulk upload error:", error);
      throw error;
    }
  };

  // Submit form data to backend
  const submitFormData = async (paths: typeof uploadedPaths) => {
    const payload: any = {
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      designation: formData.designation,
      occupation: formData.occupation,
      nationality: formData.nationality,
      state_of_origin: formData.stateOfOrigin,
      lga_of_origin: formData.lgaOfOrigin,
      residential_address: formData.residentialAddress,
      place_of_work: formData.placeOfWork,
      business_name: formData.businessName,
      business_address: formData.businessAddress,
      property_address: formData.propertyAddress,
      state: formData.state,
      area: formData.area,
      typology: formData.typology,
      landlord_package: formData.landlord_package,
      no_of_units: parseInt(formData.numberOfUnits) || 0,
      rent: parseFloat(formData.desiredAnnualRent) || 0,
      ownership_doc: paths.ownership_doc,
      gov_id: paths.gov_id,
      cac_cert: paths.cac_cert || "",
      exterior_shot: paths.exterior_shot,
      compound_road: paths.compound_road,
      power_system: paths.power_system,
      interior_rooms: paths.interior_rooms,
    };

    const response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Registration failed: ${response.statusText}`
      );
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.fullName ||
        !formData.occupation ||
        !formData.nationality ||
        !formData.stateOfOrigin ||
        !formData.lgaOfOrigin ||
        !formData.residentialAddress ||
        !formData.propertyAddress ||
        !formData.state ||
        !formData.area ||
        !formData.typology ||
        !formData.numberOfUnits ||
        !formData.landlord_package ||
        !formData.desiredAnnualRent
      ) {
        throw new Error("Please fill in all required fields marked with *");
      }

      // Validate required files
      if (
        !uploadedPaths.ownership_doc ||
        !uploadedPaths.gov_id ||
        !uploadedPaths.exterior_shot ||
        !uploadedPaths.compound_road ||
        !uploadedPaths.power_system ||
        uploadedPaths.interior_rooms.length === 0
      ) {
        throw new Error("Please upload all required files marked with *");
      }

      // Step 1: Submit form data
      showToast(
        "Submitting property details...",
        "Please wait while we register your property.",
        "success"
      );

      await submitFormData(uploadedPaths);

      // Success
      showToast(
        "Success!",
        "Property submission successful! Our team will review and contact you within 48 hours.",
        "success"
      );

      // Reset form
      setFormData({
        fullName: "",
        designation: "",
        email: "",
        phone: "",
        occupation: "",
        residentialAddress: "",
        nationality: "",
        stateOfOrigin: "",
        lgaOfOrigin: "",
        placeOfWork: "",
        businessName: "",
        businessAddress: "",
        propertyAddress: "",
        state: "",
        area: "",
        numberOfUnits: "",
        typology: "",
        landlord_package: "",
        desiredAnnualRent: "",
      });

      setFiles({
        ownershipDoc: null,
        govtId: null,
        cacCert: null,
        exteriorPhoto: null,
        roadPhoto: null,
        powerPhoto: null,
        interiorPhotos: [],
      });

      setUploadedPaths({
        ownership_doc: "",
        gov_id: "",
        cac_cert: "",
        exterior_shot: "",
        compound_road: "",
        power_system: "",
        interior_rooms: [],
      });

      // Clear localStorage
      localStorage.removeItem("landlord_form_data");
      localStorage.removeItem("landlord_uploaded_paths");
      localStorage.removeItem("landlord_current_step");

      setUploading({
        ownershipDoc: false,
        govtId: false,
        cacCert: false,
        exteriorPhoto: false,
        roadPhoto: false,
        powerPhoto: false,
        interiorPhotos: false,
      });

      setCurrentStep(0);
    } catch (error) {
      console.error("Submission error:", error);
      showToast(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to submit property. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file input changes
  const handleFileChange = async (
    field: keyof typeof files,
    fileOrFiles: File | File[] | null
  ) => {
    if (field === "interiorPhotos") {
      const actualFiles = Array.isArray(fileOrFiles)
        ? fileOrFiles
        : fileOrFiles
        ? [fileOrFiles]
        : [];

      setFiles((prev) => ({
        ...prev,
        [field]: actualFiles,
      }));

      if (actualFiles.length > 0) {
        try {
          setUploading((prev) => ({ ...prev, [field]: true }));
          const uploadedPaths = await uploadBulkFiles(actualFiles, "image");
          setUploadedPaths((prev) => ({
            ...prev,
            interior_rooms: uploadedPaths,
          }));
          showToast(
            "Files uploaded successfully",
            `${actualFiles.length} interior room photos have been uploaded.`,
            "success"
          );
        } catch (error) {
          console.error("Upload error:", error);
          showToast(
            "Upload failed",
            error instanceof Error
              ? error.message
              : "Failed to upload interior photos. Please try again.",
            "error"
          );
          setFiles((prev) => ({
            ...prev,
            [field]: [],
          }));
        } finally {
          setUploading((prev) => ({ ...prev, [field]: false }));
        }
      } else {
        setUploadedPaths((prev) => ({
          ...prev,
          interior_rooms: [],
        }));
      }
    } else {
      const actualFile = Array.isArray(fileOrFiles)
        ? fileOrFiles[0]
        : fileOrFiles;

      setFiles((prev) => ({
        ...prev,
        [field]: actualFile,
      }));

      if (actualFile) {
        try {
          setUploading((prev) => ({ ...prev, [field]: true }));
          const fileType: FileType =
            field === "exteriorPhoto" ||
            field === "roadPhoto" ||
            field === "powerPhoto"
              ? "image"
              : "document";

          const pathKeys: Record<string, keyof typeof uploadedPaths> = {
            ownershipDoc: "ownership_doc",
            govtId: "gov_id",
            cacCert: "cac_cert",
            exteriorPhoto: "exterior_shot",
            roadPhoto: "compound_road",
            powerPhoto: "power_system",
          };

          const pathKey = pathKeys[field];
          if (!pathKey) return;

          const uploadedPath = await uploadFile(actualFile, fileType);
          setUploadedPaths((prev) => ({
            ...prev,
            [pathKey]: uploadedPath,
          }));
          showToast(
            "File uploaded successfully",
            `${actualFile.name} has been uploaded.`,
            "success"
          );
        } catch (error) {
          console.error("Upload error:", error);
          showToast(
            "Upload failed",
            error instanceof Error
              ? error.message
              : "Failed to upload file. Please try again.",
            "error"
          );
          setFiles((prev) => ({
            ...prev,
            [field]: null,
          }));
        } finally {
          setUploading((prev) => ({ ...prev, [field]: false }));
        }
      } else {
        const pathKeys: Record<string, keyof typeof uploadedPaths> = {
          ownershipDoc: "ownership_doc",
          govtId: "gov_id",
          cacCert: "cac_cert",
          exteriorPhoto: "exterior_shot",
          roadPhoto: "compound_road",
          powerPhoto: "power_system",
        };
        const pathKey = pathKeys[field];
        if (pathKey) {
          setUploadedPaths((prev) => ({
            ...prev,
            [pathKey]: "",
          }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />
      <section className="relative h-[50vh] flex pb-2 pt-auto justify-center bg-[#000000] bg-transparent-[60%]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/aboutUs.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] lg:max-w-1/3 mx-auto my-auto flex pt-6">
          <div className="px-6 md:px-12 text-center m-auto">
            <h1 className="text-5xl font-bold text-white mb-4 font-raleway">
              Bridgent Partnership
            </h1>
          </div>
        </div>
      </section>

      {/* Login/Registration Awareness Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-sm border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-raleway">
                {isAuthenticated
                  ? `Welcome back, ${user?.full_name || "Partner"}!`
                  : "Already a Partner?"}
              </h2>
              <p className="text-gray-600 max-w-xl">
                {isAuthenticated
                  ? "Access your dashboard to manage your properties, view remittances, and track maintenance requests."
                  : "If you already have a landlord account with us, please login to manage your properties. Otherwise, fill the form below to become a partner."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {isAuthenticated ? (
                <Link
                  href={user?.role === "landlord" ? "/landlord" : "/profile"}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-montserrat h-12 px-8">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/signin" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5 font-montserrat h-12 px-8"
                  >
                    Login to Portal
                  </Button>
                </Link>
              )}
              <Button
                onClick={scrollToForm}
                className="w-full sm:w-auto bg-[#C9A227] hover:bg-[#B38F22] text-white font-montserrat h-12 px-8"
              >
                Become a Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            toastMessage.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toastMessage.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <div className="h-5 w-5 text-red-400">!</div>
              )}
            </div>
            <div className="ml-3">
              <h3
                className={`text-sm font-medium ${
                  toastMessage.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {toastMessage.title}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  toastMessage.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {toastMessage.description}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto pl-3"
            >
              <span className="sr-only">Close</span>
              <span
                className={`h-5 w-5 ${
                  toastMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ×
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="pt-4 pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 font-raleway">
              Securing Your Legacy Asset
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our network of premium property owners and enjoy consistent
              income without management burden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-[#C9A227]">
              <CardHeader
                className="bg-[#C9A227] rounded-t-lg text-white cursor-pointer"
                onClick={() => toggleSection("prime")}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="font-raleway">
                    EZ-Prime Partner
                  </CardTitle>
                  {expandedSections.prime ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 font-semibold">
                  Ready-to-go assets. Immediate onboarding.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                    <span>Property meets 100% of ACCESS Standard criteria</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                    <span>No modifications or financial leverage needed</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                    <span>
                      Fast-tracked listing (7-10 days after inspection)
                    </span>
                  </li>
                </ul>

                {expandedSections.prime && (
                  <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Prime Partner Benefits:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Zero involvement with Capital Legacy Partners (CLP)
                      </li>
                      <li>• Immediate access to full net remittance</li>
                      <li>• No amortization deductions</li>
                      <li>
                        • Bridgent guarantees Monthly Gross Rent minus only 10%
                        management fee
                      </li>
                      <li>• Highest percentage of rent retained monthly</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader
                className="bg-primary rounded-t-lg text-white cursor-pointer"
                onClick={() => toggleSection("vantage")}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="font-raleway">
                    EZ-Vantage Partner
                  </CardTitle>
                  {expandedSections.vantage ? <ChevronUp /> : <ChevronDown />}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 font-semibold">
                  Asset requires strategic upgrade. Facilitated secured
                  financing via Capital Legacy Partners.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      Meets aesthetic/space standards but fails critical
                      criteria
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Uses CLP facility for mandatory upgrades</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      Property value enhancement for higher rental rates
                    </span>
                  </li>
                </ul>

                {expandedSections.vantage && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Vantage Partner Features:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • CLP secured loan for upgrades (Solar, AC, renovation,
                        etc.)
                      </li>
                      <li>• Automatic loan repayment from Gross Rent</li>
                      <li>
                        • Monthly remittance = MGR - CLP Amortization - Bridgent
                        Fee
                      </li>
                      <li>
                        • Property upgraded while receiving guaranteed income
                      </li>
                      <li>• Fixed amortization schedule by CLP</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-raleway text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                The ACCESSS Standard
              </CardTitle>
              <p className="text-gray-600">
                We only manage assets that deliver House Serenity. Your property
                must meet these world-class criteria:
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => toggleSection("aesthetics")}
                >
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    A. Aesthetics & Finishing
                  </h3>
                  {expandedSections.aesthetics ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </div>
                {expandedSections.aesthetics && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Paint & Walls
                          </h4>
                          <p className="text-sm text-gray-600">
                            Newly painted (within 12 months) with premium
                            washable matte/eggshell finish. Walls must be
                            perfectly smooth, free of cracks, dampness, or
                            stains.
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Flooring
                          </h4>
                          <p className="text-sm text-gray-600">
                            High-grade ceramic/porcelain tiles (min. 60x60cm) or
                            premium wood laminate flooring in all living areas
                            and bedrooms.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Lighting & Sockets
                          </h4>
                          <p className="text-sm text-gray-600">
                            LED only. Adequate recessed/surface-mounted fixtures
                            (3000K). Min. 4 sockets per living space, 2 per
                            bedroom wall (modern, tamper-resistant, three-pin).
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Kitchen & Restrooms
                          </h4>
                          <p className="text-sm text-gray-600">
                            Built-in cabinets with durable countertops
                            (granite/engineered stone). Contemporary WC/WHB with
                            chrome fixtures. Frameless glass shower or clean
                            curtain rod.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => toggleSection("power")}
                >
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    B. Power Systems & Guaranteed Supply
                  </h3>
                  {expandedSections.power ? <ChevronUp /> : <ChevronDown />}
                </div>
                {expandedSections.power && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">
                          Guaranteed Power Time
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              10 Hours Night: 7:00 PM to 5:00 AM
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">
                              5 Hours Day: 10:00 AM to 3:00 PM
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">
                          System Requirements
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              Solar & Inverter Systems preferred
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <VolumeX className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              Generators must be soundproofed
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            All systems linked to Bridgent monitoring for SLA
                            adherence
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => toggleSection("comfort")}
                >
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    C. Comfort & Space
                  </h3>
                  {expandedSections.comfort ? <ChevronUp /> : <ChevronDown />}
                </div>
                {expandedSections.comfort && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Window Sizes
                          </h4>
                          <p className="text-sm text-gray-600">
                            Min. 15% window-to-wall ratio in all habitable rooms
                            for natural light and cross-ventilation.
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Cross-Ventilation
                          </h4>
                          <p className="text-sm text-gray-600">
                            Every room must have windows/openings on at least
                            two different walls for effective airflow.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Room Dimensions
                          </h4>
                          <p className="text-sm text-gray-600">
                            <strong>Bedroom:</strong> Min. 3m x 3.5m
                            <br />
                            <strong>Living Room:</strong> Min. 4m x 5m
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Air Conditioning
                          </h4>
                          <p className="text-sm text-gray-600">
                            Mandatory split units in all bedrooms and living
                            area (1.5 HP living, 1.0 HP bedrooms). Must be
                            functional, clean, and &lt;5 years old.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => toggleSection("compound")}
                >
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    D. Compound & Environment
                  </h3>
                  {expandedSections.compound ? <ChevronUp /> : <ChevronDown />}
                </div>
                {expandedSections.compound && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Access & Road
                          </h4>
                          <p className="text-sm text-gray-600">
                            Paved access road from main street. Internal
                            compound fully interlocked/tiled/paved.
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Green Space
                          </h4>
                          <p className="text-sm text-gray-600">
                            Recommended: Small green areas, flower planters, or
                            garden space for aesthetic appeal.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Hygiene & Environment
                          </h4>
                          <p className="text-sm text-gray-600">
                            No ongoing construction nearby. Dedicated waste
                            disposal. Efficient drainage (no pooling water).
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded">
                          <h4 className="font-semibold text-primary">
                            Security Perimeter
                          </h4>
                          <p className="text-sm text-gray-600">
                            High secured walls (min 2.4m) with barb
                            wire/electric fence. Functional gatehouse/security
                            post.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card id="registration-form">
            <CardHeader>
              <CardTitle className="font-raleway text-2xl">
                Property Registration Form
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">
                      Personal & Legal Information
                    </h3>
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
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          value={formData.designation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designation: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="occupation">Email *</Label>
                        <Input
                          id="occupation"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="occupation">Phone Number *</Label>
                        <Input
                          id="occupation"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="occupation">Occupation *</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              occupation: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality *</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nationality: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stateOfOrigin">State of Origin *</Label>
                        <Select
                          value={formData.stateOfOrigin}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              stateOfOrigin: value,
                              lgaOfOrigin: "", // Reset LGA when state changes
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your state of origin" />
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
                        <Label htmlFor="lgaOfOrigin">LGA of Origin *</Label>
                        <Select
                          value={formData.lgaOfOrigin}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              lgaOfOrigin: value,
                            })
                          }
                          disabled={!formData.stateOfOrigin}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                formData.stateOfOrigin
                                  ? "Select your LGA"
                                  : "Select state first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.stateOfOrigin &&
                              NIGERIAN_STATES_LGAS[formData.stateOfOrigin]?.map(
                                (lga) => (
                                  <SelectItem key={lga} value={lga}>
                                    {lga}
                                  </SelectItem>
                                )
                              )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="residentialAddress">
                          Residential Address *
                        </Label>
                        <Textarea
                          id="residentialAddress"
                          value={formData.residentialAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              residentialAddress: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="placeOfWork">Place of Work</Label>
                        <Input
                          id="placeOfWork"
                          value={formData.placeOfWork}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              placeOfWork: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessName">
                          Business Name (if applicable)
                        </Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="businessAddress">
                          Business Address (if applicable)
                        </Label>
                        <Textarea
                          id="businessAddress"
                          value={formData.businessAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessAddress: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">
                      Core Property Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="propertyAddress">
                          Choose Package *
                        </Label>
                        <Select
                          value={formData.landlord_package}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              landlord_package: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prime">Ez-Prime</SelectItem>
                            <SelectItem value="vantage">Ez-Vantage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="propertyAddress">
                          Property Address *
                        </Label>
                        <Textarea
                          id="propertyAddress"
                          value={formData.propertyAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              propertyAddress: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              state: value,
                              area: "", // Reset area when state changes
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select property state" />
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
                        <Label htmlFor="area">Area (LGA) *</Label>
                        <Select
                          value={formData.area}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              area: value,
                            })
                          }
                          disabled={!formData.state}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                formData.state
                                  ? "Select property area"
                                  : "Select state first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.state &&
                              NIGERIAN_STATES_LGAS[formData.state]?.map(
                                (lga) => (
                                  <SelectItem key={lga} value={lga}>
                                    {lga}
                                  </SelectItem>
                                )
                              )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="typology">Typology *</Label>
                        <Input
                          id="typology"
                          placeholder="e.g., Flat, Duplex, Bungalow"
                          value={formData.typology}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              typology: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="numberOfUnits">Number of Units *</Label>
                        <Input
                          id="numberOfUnits"
                          type="number"
                          min="1"
                          value={formData.numberOfUnits}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              numberOfUnits: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="desiredAnnualRent">
                          Desired Annual Gross Rent (NGN) *
                        </Label>
                        <Input
                          id="desiredAnnualRent"
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="e.g., 6000000"
                          value={formData.desiredAnnualRent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              desiredAnnualRent: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">
                      Document Uploads
                    </h3>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label
                          htmlFor="ownershipDoc"
                          className="cursor-pointer"
                        >
                          <span className="text-primary font-semibold">
                            Ownership Document
                          </span>
                          <span className="text-gray-600">
                            {" "}
                            (C of O, Deed, etc.) *
                          </span>
                        </Label>
                        <Input
                          id="ownershipDoc"
                          type="file"
                          className="mt-2"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "ownershipDoc",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                        {uploading.ownershipDoc && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.ownershipDoc && !uploading.ownershipDoc && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {files.ownershipDoc.name} uploaded
                          </p>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="govtId" className="cursor-pointer">
                          <span className="text-primary font-semibold">
                            Valid Government ID
                          </span>{" "}
                          *
                        </Label>
                        <Input
                          id="govtId"
                          type="file"
                          className="mt-2"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) =>
                            handleFileChange(
                              "govtId",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                        {uploading.govtId && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.govtId && !uploading.govtId && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {files.govtId.name} uploaded
                          </p>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="cacCert" className="cursor-pointer">
                          <span className="text-primary font-semibold">
                            CAC Certificate
                          </span>
                          <span className="text-gray-600">
                            {" "}
                            (If business-owned)
                          </span>
                        </Label>
                        <Input
                          id="cacCert"
                          type="file"
                          className="mt-2"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "cacCert",
                              e.target.files?.[0] || null
                            )
                          }
                        />
                        {uploading.cacCert && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.cacCert && !uploading.cacCert && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {files.cacCert.name} uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">
                      Media Upload & Requirements
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Important:</strong> Ensure photos are
                        high-resolution and taken in bright light, showing all
                        corners of the room.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label
                          htmlFor="exteriorPhoto"
                          className="cursor-pointer"
                        >
                          <span className="text-primary font-semibold">
                            Exterior Shot *
                          </span>
                        </Label>
                        <Input
                          id="exteriorPhoto"
                          type="file"
                          accept="image/*"
                          className="mt-2"
                          onChange={(e) =>
                            handleFileChange(
                              "exteriorPhoto",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                        {uploading.exteriorPhoto && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.exteriorPhoto && !uploading.exteriorPhoto && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {files.exteriorPhoto.name} uploaded
                          </p>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="roadPhoto" className="cursor-pointer">
                          <span className="text-primary font-semibold">
                            Road/Compound *
                          </span>
                        </Label>
                        <Input
                          id="roadPhoto"
                          type="file"
                          accept="image/*"
                          className="mt-2"
                          onChange={(e) =>
                            handleFileChange(
                              "roadPhoto",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                        {uploading.roadPhoto && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.roadPhoto && !uploading.roadPhoto && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {files.roadPhoto.name} uploaded
                          </p>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="powerPhoto" className="cursor-pointer">
                          <span className="text-primary font-semibold">
                            Power System *
                          </span>
                        </Label>
                        <Input
                          id="powerPhoto"
                          type="file"
                          accept="image/*"
                          className="mt-2"
                          onChange={(e) =>
                            handleFileChange(
                              "powerPhoto",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                        {uploading.powerPhoto && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.powerPhoto && !uploading.powerPhoto && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ {files.powerPhoto.name} uploaded
                          </p>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label
                          htmlFor="interiorPhoto"
                          className="cursor-pointer"
                        >
                          <span className="text-primary font-semibold">
                            Interior Rooms *
                          </span>
                        </Label>
                        <Input
                          id="interiorPhoto"
                          type="file"
                          accept="image/*"
                          className="mt-2"
                          multiple
                          onChange={(e) =>
                            handleFileChange(
                              "interiorPhotos",
                              e.target.files ? Array.from(e.target.files) : []
                            )
                          }
                          required
                        />
                        {uploading.interiorPhotos && (
                          <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </p>
                        )}
                        {files.interiorPhotos.length > 0 &&
                          !uploading.interiorPhotos && (
                            <p className="text-sm text-green-600 mt-2">
                              ✓ {files.interiorPhotos.length} photos uploaded
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || isSubmitting}
                    className="font-montserrat"
                  >
                    Previous
                  </Button>
                  {currentStep < totalSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary font-montserrat"
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-primary font-montserrat"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Property for Verification"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
