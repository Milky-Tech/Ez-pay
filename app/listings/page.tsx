"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/header";
import ChatWidget from "@/app/components/ui/chat-widget";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { MapPin, Bed, Home, Zap, Bath, Square, SearchIcon } from "lucide-react";
import { type Property } from "@/lib/types";
import PropertyFilter from "./component/filter";
import Footer from "../components/footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/listings`);
        if (!response.ok) throw new Error("Failed to fetch listings");
        const data = await response.json();
        const listings = data.data || data;
        setProperties(listings);
        setFilteredProperties(listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, filterState, maxPrice, properties]);

  const filterProperties = () => {
    let filtered = properties;

    // Search (already exists)
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.typology.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.code_name &&
            p.code_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (filterState !== "all") {
      filtered = filtered.filter((p) => p.state === filterState);
    }

    // Price filter
    if (maxPrice > 0) {
      filtered = filtered.filter((p) => {
        const price = p.monthly_cost || (p.rent * 1.1) / 12 / p.no_of_units;

        return price <= maxPrice;
      });
    }

    setFilteredProperties(filtered);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Contact for Price";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChatWidget />
      <section className="relative h-[65vh] flex pb-2 pt-auto justify-center bg-[#000000] bg-transparent-[60%]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/aboutUs.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] lg:max-w-1/3 mx-auto my-auto flex pt-6">
          <div className="px-6 md:px-12 text-center m-auto">
            <h1 className="text-5xl font-bold text-white mb-4 font-raleway">
              Premium Properties
            </h1>
            <Card className="bg-gray-200 bg-opacity-10 border-0 rounded-full">
              <CardContent className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Search by location, property type, or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="font-montserrat relative bg-inherit text-white border-gray-500 rounded-full"
                    />
                    {/* <SearchIcon className="realtive z-40 left-3 transform text-gray-400" /> */}
                  </div>
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="font-montserrat bg-primary border-0 text-white rounded-full">
                      <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="Lagos">Lagos</SelectItem>
                      <SelectItem value="Abuja">Abuja</SelectItem>
                      <SelectItem value="Port Harcourt">
                        Port Harcourt
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sticky top-20 z-40 bg-gray-50 pb-4">
            <PropertyFilter maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Listings */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading properties...</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No properties found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <Card
                      key={property.id}
                      className="overflow-hidden border-2 border-accent/20 hover:border-accent hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        {(() => {
                          const rooms = property.interior_rooms;
                          const roomsArray = Array.isArray(rooms)
                            ? rooms
                            : typeof rooms === "string"
                            ? JSON.parse(rooms)
                            : [];

                          return roomsArray && roomsArray.length > 0 ? (
                            <img
                              src={`https://ez-pay.realestway.com/${roomsArray[0]?.toString()}`}
                              alt={property.typology}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <Home className="h-16 w-16 text-gray-400" />
                            </div>
                          );
                        })()}
                      </div>
                      <CardContent className="p-6">
                        {property.code_name && (
                          <p className="text-sm text-gray-500 mb-2 font-montserrat">
                            {property.code_name}
                          </p>
                        )}
                        <h3 className="text-xl font-bold text-primary mb-2 font-raleway line-clamp-1">
                          {property.typology}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {property.area}, {property.state}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-gray-600">
                              <Bed className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {property.bedrooms} beds
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Bath className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {property.bathrooms} baths
                              </span>
                            </div>
                            {property.square_feet && (
                              <div className="flex items-center text-gray-600">
                                <Square className="h-4 w-4 mr-1" />
                                <span className="text-sm">
                                  {property.square_feet.toLocaleString()} sqft
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-4 flex flex-col">
                          <p className="text-2xl font-bold text-primary mb-4 font-raleway">
                            {formatPrice(
                              property.monthly_cost ||
                                (property.rent * 1.1) /
                                  12 /
                                  property.no_of_units
                            )}
                            <span className="text-sm text-gray-600">
                              /month
                            </span>
                          </p>
                          <Link
                            href={`/listings/${
                              property.code_name || property.id
                            }`}
                          >
                            <Button className="w-full bg-white border-2 border-primary rounded-xl py-6 text-primary text-xl hover:bg-primary/90 font-montserrat">
                              View Property Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && filteredProperties.length > 0 && (
                <div className="mt-12 text-center">
                  <p className="text-gray-600">
                    Showing {filteredProperties.length} of {properties.length}{" "}
                    properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
