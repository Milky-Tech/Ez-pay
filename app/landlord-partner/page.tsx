"use client";

import { useState } from "react";
import Header from "@/components/header";
import ChatWidget from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";

export default function LandlordPartnerPage() {
  const [currentStep, setCurrentStep] = useState(0);
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
  });

  const totalSteps = 4;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Property submission successful! Our team will review and contact you within 48 hours."
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-4 font-raleway">
              Bridgent Partnership: Securing Your Legacy Asset
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our network of premium property owners and enjoy consistent
              income without management burden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-secondary">
              <CardHeader
                className="bg-secondary text-white cursor-pointer"
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
                className="bg-primary text-white cursor-pointer"
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
                            All systems linked to Bridgett monitoring for SLA
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

          <Card>
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
                        <Input
                          id="stateOfOrigin"
                          value={formData.stateOfOrigin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stateOfOrigin: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lgaOfOrigin">LGA of Origin *</Label>
                        <Input
                          id="lgaOfOrigin"
                          value={formData.lgaOfOrigin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lgaOfOrigin: e.target.value,
                            })
                          }
                          required
                        />
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
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area *</Label>
                        <Input
                          id="area"
                          value={formData.area}
                          onChange={(e) =>
                            setFormData({ ...formData, area: e.target.value })
                          }
                          required
                        />
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
                          required
                        />
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
                          required
                        />
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
                        <Input id="cacCert" type="file" className="mt-2" />
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
                          required
                        />
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
                          required
                        />
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
                          required
                        />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label
                          htmlFor="interiorPhotos"
                          className="cursor-pointer"
                        >
                          <span className="text-primary font-semibold">
                            All Interior Rooms *
                          </span>
                          <span className="text-gray-600">
                            {" "}
                            (Multiple files)
                          </span>
                        </Label>
                        <Input
                          id="interiorPhotos"
                          type="file"
                          accept="image/*"
                          multiple
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="font-montserrat"
                  >
                    Previous
                  </Button>
                  {currentStep < totalSteps - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary font-montserrat"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-primary font-montserrat"
                    >
                      Submit Property for Verification
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
