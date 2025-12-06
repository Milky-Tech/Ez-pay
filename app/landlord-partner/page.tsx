'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import ChatWidget from '@/components/chat-widget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Home } from 'lucide-react';

export default function LandlordPartnerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    occupation: '',
    residentialAddress: '',
    nationality: '',
    stateOfOrigin: '',
    lgaOfOrigin: '',
    placeOfWork: '',
    businessName: '',
    businessAddress: '',
    propertyAddress: '',
    state: '',
    area: '',
    numberOfUnits: '',
    typology: '',
    desiredAnnualRent: '',
  });

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

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
    alert('Property submission successful! Our team will review and contact you within 48 hours.');
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
              Join our network of premium property owners and enjoy consistent income without management burden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-secondary">
              <CardHeader className="bg-secondary text-white">
                <CardTitle className="font-raleway">EZ-Prime Partner</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4">Ready-to-go assets. Immediate onboarding.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                    <span>Property meets all standards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                    <span>Fast approval process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                    <span>Immediate listing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader className="bg-primary text-white">
                <CardTitle className="font-raleway">EZ-Vantage Partner</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4">Asset requires strategic upgrade. Facilitated secured financing via Capital Legacy Partners.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Property upgrade financing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Professional renovation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Increased property value</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-raleway text-2xl">The ACCESSS Standard</CardTitle>
              <p className="text-gray-600">We only manage assets that deliver House Serenity. Your property must meet these world-class criteria:</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">Aesthetics & Finishing</h3>
                  <p className="text-sm text-gray-600">Premium, durable finishes; modern fixtures; pristine paint; functional lighting; high-end tiling; seamless ceilings.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">Space & Layout</h3>
                  <p className="text-sm text-gray-600">Generous room sizes; cross-ventilation in ALL rooms; large windows for natural light; modern kitchen and contemporary restroom design.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">Compound & Environment</h3>
                  <p className="text-sm text-gray-600">Paved access road; excellent drainage; well-secured perimeter; provision for gateman/security post; aesthetically pleasing exterior facade.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">Utility & Power</h3>
                  <p className="text-sm text-gray-600">Guaranteed 15+ hours power: Functional solar/inverter system or highly reliable backup generator.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-raleway text-2xl">Property Registration Form</CardTitle>
              {/* <Progress value={progress} className="mt-4" /> */}
              <p className="text-sm text-gray-600 mt-2">Step {currentStep + 1} of {totalSteps}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Personal & Legal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="occupation">Occupation *</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality *</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stateOfOrigin">State of Origin *</Label>
                        <Input
                          id="stateOfOrigin"
                          value={formData.stateOfOrigin}
                          onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lgaOfOrigin">LGA of Origin *</Label>
                        <Input
                          id="lgaOfOrigin"
                          value={formData.lgaOfOrigin}
                          onChange={(e) => setFormData({ ...formData, lgaOfOrigin: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="residentialAddress">Residential Address *</Label>
                        <Textarea
                          id="residentialAddress"
                          value={formData.residentialAddress}
                          onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="placeOfWork">Place of Work</Label>
                        <Input
                          id="placeOfWork"
                          value={formData.placeOfWork}
                          onChange={(e) => setFormData({ ...formData, placeOfWork: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessName">Business Name (if applicable)</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="businessAddress">Business Address (if applicable)</Label>
                        <Textarea
                          id="businessAddress"
                          value={formData.businessAddress}
                          onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Core Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="propertyAddress">Property Address *</Label>
                        <Textarea
                          id="propertyAddress"
                          value={formData.propertyAddress}
                          onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area *</Label>
                        <Input
                          id="area"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="typology">Typology *</Label>
                        <Input
                          id="typology"
                          placeholder="e.g., Flat, Duplex, Bungalow"
                          value={formData.typology}
                          onChange={(e) => setFormData({ ...formData, typology: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="numberOfUnits">Number of Units *</Label>
                        <Input
                          id="numberOfUnits"
                          type="number"
                          value={formData.numberOfUnits}
                          onChange={(e) => setFormData({ ...formData, numberOfUnits: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="desiredAnnualRent">Desired Annual Gross Rent (NGN) *</Label>
                        <Input
                          id="desiredAnnualRent"
                          type="number"
                          placeholder="e.g., 6000000"
                          value={formData.desiredAnnualRent}
                          onChange={(e) => setFormData({ ...formData, desiredAnnualRent: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Document Uploads</h3>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="ownershipDoc" className="cursor-pointer">
                          <span className="text-primary font-semibold">Ownership Document</span>
                          <span className="text-gray-600"> (C of O, Deed, etc.) *</span>
                        </Label>
                        <Input id="ownershipDoc" type="file" className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="govtId" className="cursor-pointer">
                          <span className="text-primary font-semibold">Valid Government ID</span> *
                        </Label>
                        <Input id="govtId" type="file" className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="cacCert" className="cursor-pointer">
                          <span className="text-primary font-semibold">CAC Certificate</span>
                          <span className="text-gray-600"> (If business-owned)</span>
                        </Label>
                        <Input id="cacCert" type="file" className="mt-2" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Media Upload & Requirements</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Important:</strong> Ensure photos are high-resolution and taken in bright light, showing all corners of the room.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="exteriorPhoto" className="cursor-pointer">
                          <span className="text-primary font-semibold">Exterior Shot *</span>
                        </Label>
                        <Input id="exteriorPhoto" type="file" accept="image/*" className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="roadPhoto" className="cursor-pointer">
                          <span className="text-primary font-semibold">Road/Compound *</span>
                        </Label>
                        <Input id="roadPhoto" type="file" accept="image/*" className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="powerPhoto" className="cursor-pointer">
                          <span className="text-primary font-semibold">Power System *</span>
                        </Label>
                        <Input id="powerPhoto" type="file" accept="image/*" className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="interiorPhotos" className="cursor-pointer">
                          <span className="text-primary font-semibold">All Interior Rooms *</span>
                          <span className="text-gray-600"> (Multiple files)</span>
                        </Label>
                        <Input id="interiorPhotos" type="file" accept="image/*" multiple className="mt-2" required />
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
                    <Button type="button" onClick={handleNext} className="bg-primary font-montserrat">
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-primary font-montserrat">
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
