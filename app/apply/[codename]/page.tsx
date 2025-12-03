'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Upload } from 'lucide-react';

export default function RentalApplicationPage() {
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    currentAddress: '',
    currentLandlordName: '',
    currentLandlordContact: '',
    reasonForLeaving: '',
    durationOfStay: '',
    companyName: '',
    hrContact: '',
    desiredStartDate: '',
    paymentPlan: 'ez_anchor' as 'ez_anchor' | 'ez_ascend',
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
    alert('Application submitted successfully! You will receive an email confirmation shortly. Our team will review your application within 2 weeks.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4 font-raleway">
              Rental Application
            </h1>
            <p className="text-lg text-gray-600">
              Property Code: {params.codename}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-raleway text-2xl">Application Form</CardTitle>
              <Progress value={progress} className="mt-4" />
              <p className="text-sm text-gray-600 mt-2">Step {currentStep + 1} of {totalSteps}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Bio & Current Residency</h3>
                    <div className="space-y-4">
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
                        <Label htmlFor="currentAddress">Current Residential Address *</Label>
                        <Textarea
                          id="currentAddress"
                          value={formData.currentAddress}
                          onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currentLandlordName">Current Landlord's Full Name *</Label>
                          <Input
                            id="currentLandlordName"
                            value={formData.currentLandlordName}
                            onChange={(e) => setFormData({ ...formData, currentLandlordName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentLandlordContact">Landlord's Contact *</Label>
                          <Input
                            id="currentLandlordContact"
                            value={formData.currentLandlordContact}
                            onChange={(e) => setFormData({ ...formData, currentLandlordContact: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reasonForLeaving">Reason for Leaving *</Label>
                        <Textarea
                          id="reasonForLeaving"
                          value={formData.reasonForLeaving}
                          onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="durationOfStay">Duration of Stay at Current Residence *</Label>
                        <Input
                          id="durationOfStay"
                          placeholder="e.g., 2 years"
                          value={formData.durationOfStay}
                          onChange={(e) => setFormData({ ...formData, durationOfStay: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Financial & Employment</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Company/Business Name *</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="hrContact">HR/Owner Contact *</Label>
                        <Input
                          id="hrContact"
                          placeholder="Email or Phone"
                          value={formData.hrContact}
                          onChange={(e) => setFormData({ ...formData, hrContact: e.target.value })}
                          required
                        />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="bankStatements" className="block text-center">
                          <span className="text-primary font-semibold">Upload Last 6 Months Bank Statements</span> *
                        </Label>
                        <Input id="bankStatements" type="file" multiple className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="workId" className="block text-center">
                          <span className="text-primary font-semibold">Work ID/Business ID/CAC</span> *
                        </Label>
                        <Input id="workId" type="file" className="mt-2" required />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Identification & Security</h3>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="govtId" className="block text-center">
                          <span className="text-primary font-semibold">Government-Issued ID</span> *
                        </Label>
                        <Input id="govtId" type="file" accept="image/*,.pdf" className="mt-2" required />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 font-semibold mb-2">Live Photo & Video Verification</p>
                        <p className="text-sm text-gray-600">
                          For identity verification, you will need to take a live photo and record a 5-second video.
                          This helps us prevent fraud and ensure the security of all parties.
                        </p>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="livePhoto" className="block text-center">
                          <span className="text-primary font-semibold">Live Photo</span> *
                        </Label>
                        <Input id="livePhoto" type="file" accept="image/*" capture="user" className="mt-2" required />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <Label htmlFor="liveVideo" className="block text-center">
                          <span className="text-primary font-semibold">5-Second Video</span> *
                        </Label>
                        <Input id="liveVideo" type="file" accept="video/*" capture="user" className="mt-2" required />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-montserrat mb-4">Terms & Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="desiredStartDate">Desired Lease Start Date *</Label>
                        <Input
                          id="desiredStartDate"
                          type="date"
                          value={formData.desiredStartDate}
                          onChange={(e) => setFormData({ ...formData, desiredStartDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          <strong>Minimum Stay:</strong> 4 months (as per EZ-Pay terms)
                        </p>
                      </div>
                      <div>
                        <Label className="mb-3 block">Payment Plan Preference *</Label>
                        <RadioGroup value={formData.paymentPlan} onValueChange={(value: any) => setFormData({ ...formData, paymentPlan: value })}>
                          <div className="flex items-start space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="ez_anchor" id="ez_anchor" className="mt-1" />
                            <Label htmlFor="ez_anchor" className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-semibold text-primary">EZ-Anchor</p>
                                <p className="text-sm text-gray-600">
                                  Fixed monthly rate throughout your stay. Predictable and stable.
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-start space-x-2 border rounded-lg p-4">
                            <RadioGroupItem value="ez_ascend" id="ez_ascend" className="mt-1" />
                            <Label htmlFor="ez_ascend" className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-semibold text-primary">EZ-Ascend</p>
                                <p className="text-sm text-gray-600">
                                  Lower initial rate with gradual increase. Easier start for your finances.
                                </p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
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
                      Submit Application & Initiate Vetting
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
