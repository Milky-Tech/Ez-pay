'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header';
import ChatWidget from '@/components/chat-widget';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Bed, Bath, Square, Zap, Shield, Droplet, CheckCircle, Calendar, Video } from 'lucide-react';
import { supabase, type Property } from '@/lib/supabase';

export default function PropertyDetailsPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectionType, setInspectionType] = useState<'physical' | 'virtual'>('physical');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionEmail, setInspectionEmail] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [params.codename]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`code_name.eq.${params.codename},id.eq.${params.codename}`)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${inspectionType === 'physical' ? 'Physical' : 'Virtual'} inspection booked successfully! Confirmation email sent to ${inspectionEmail}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Property Not Found</h2>
            <Link href="/listings">
              <Button>Back to Listings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Contact for Price';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/listings" className="text-primary hover:underline font-montserrat">
              &larr; Back to Listings
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300">
                  {property.lead_image_url ? (
                    <img
                      src={property.lead_image_url}
                      alt={property.typology}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Square className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                  <Badge className="absolute top-4 right-4 bg-secondary text-white font-montserrat text-lg px-4 py-2">
                    Available Now
                  </Badge>
                </div>
              </Card>

              <Card>
                <CardContent className="p-8">
                  {property.code_name && (
                    <p className="text-sm text-gray-500 mb-2 font-montserrat">{property.code_name}</p>
                  )}
                  <h1 className="text-4xl font-bold text-primary mb-4 font-raleway">
                    {property.typology}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.property_address}</span>
                  </div>

                  <div className="border-t border-b py-6 mb-6">
                    <h2 className="text-2xl font-semibold text-primary mb-4 font-raleway">Property Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <Bed className="h-5 w-5 text-secondary mr-2" />
                        <span>{property.number_of_units} Units</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-5 w-5 text-secondary mr-2" />
                        <span>{property.typology}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-secondary mr-2" />
                        <span>{property.area}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-primary mb-4 font-raleway">Amenities & Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Guaranteed 15+ hours of power daily</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Dedicated Facility Manager</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Water Treatment System</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>24/7 Gated Security</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Paved Compound & Roads</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Premium Finishes</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-primary mb-2 font-raleway">About This Property</h3>
                    <p className="text-gray-700">
                      This premium {property.typology.toLowerCase()} is part of our verified collection that meets the ACCESSS Standard.
                      Every aspect has been carefully evaluated to ensure you experience House Serenity.
                      With guaranteed power, professional management, and premium amenities, this property offers unmatched comfort and reliability.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Monthly EZ-Pay Rate</p>
                    <p className="text-4xl font-bold text-primary font-raleway">
                      {formatPrice(property.monthly_cost)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">per month</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-primary hover:bg-primary/90 font-montserrat text-lg py-6">
                          <Calendar className="mr-2 h-5 w-5" />
                          Inspect Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-raleway">Book an Inspection</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleInspectionBooking} className="space-y-4">
                          <div>
                            <Label className="mb-3 block">Inspection Type</Label>
                            <RadioGroup value={inspectionType} onValueChange={(value: any) => setInspectionType(value)}>
                              <div className="flex items-center space-x-2 border rounded-lg p-3">
                                <RadioGroupItem value="physical" id="physical" />
                                <Label htmlFor="physical" className="flex-1 cursor-pointer">
                                  <div>
                                    <p className="font-semibold">Physical Inspection</p>
                                    <p className="text-sm text-gray-600">In-person visit (Paid)</p>
                                  </div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 border rounded-lg p-3">
                                <RadioGroupItem value="virtual" id="virtual" />
                                <Label htmlFor="virtual" className="flex-1 cursor-pointer">
                                  <div>
                                    <p className="font-semibold">Virtual Inspection</p>
                                    <p className="text-sm text-gray-600">Video tour (Free)</p>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div>
                            <Label htmlFor="date">Preferred Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={inspectionDate}
                              onChange={(e) => setInspectionDate(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={inspectionEmail}
                              onChange={(e) => setInspectionEmail(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full bg-primary font-montserrat">
                            Confirm Booking
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Link href={`/apply/${property.code_name || property.id}`}>
                      <Button className="w-full bg-secondary hover:bg-secondary/90 font-montserrat text-lg py-6">
                        Rent Now
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center text-secondary mb-2">
                      <Zap className="h-5 w-5 mr-2" />
                      <span className="font-semibold">15+ hours guaranteed power</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Shield className="h-5 w-5 mr-2" />
                      <span>24/7 Security & Management</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Droplet className="h-5 w-5 mr-2" />
                      <span>Water Treatment Included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
