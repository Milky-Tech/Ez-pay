'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import ChatWidget from '@/components/chat-widget';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Bed, Home, Zap } from 'lucide-react';
import { supabase, type Property } from '@/lib/supabase';

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, filterState, properties]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('availability_status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.typology.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.code_name && p.code_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterState !== 'all') {
      filtered = filtered.filter((p) => p.state === filterState);
    }

    setFilteredProperties(filtered);
  };

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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-4 font-raleway">
              Premium Properties Available
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover verified high-end homes with guaranteed power and monthly payment options
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search by location, property type, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-montserrat"
                  />
                </div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="font-montserrat">
                    <SelectValue placeholder="Filter by State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden border-2 border-accent/20 hover:border-accent hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                    {property.lead_image_url ? (
                      <img
                        src={property.lead_image_url}
                        alt={property.typology}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-secondary text-white font-montserrat">
                      Available Now
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    {property.code_name && (
                      <p className="text-sm text-gray-500 mb-2 font-montserrat">{property.code_name}</p>
                    )}
                    <h3 className="text-xl font-bold text-primary mb-2 font-raleway">
                      {property.typology}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.area}, {property.state}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-secondary">
                        <Zap className="h-5 w-5 mr-1" />
                        <span className="text-sm font-semibold">15+ hrs power</span>
                      </div>
                      {property.number_of_units > 1 && (
                        <div className="flex items-center text-gray-600">
                          <Bed className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.number_of_units} units</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-2xl font-bold text-primary mb-4 font-raleway">
                        {formatPrice(property.monthly_cost)}<span className="text-sm text-gray-600">/month</span>
                      </p>
                      <Link href={`/listings/${property.code_name || property.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90 font-montserrat">
                          View Property Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
