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
import {
  MapPin,
  Bed,
  Home,
  Zap,
  Bath,
  Square,
  SearchIcon,
  ArrowRight,
  Car,
} from "lucide-react";
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
            p.code_name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Location filter
    if (filterState !== "all") {
      filtered = filtered.filter((p) => p.state === filterState);
    }

    // Price filter
    if (maxPrice > 0) {
      filtered = filtered.filter((p) => {
        const price = (p.rent * 1.1) / 12 / (p.no_of_units || 1);

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
                      className="font-montserrat relative bg-inherit border-0 text-white rounded-full"
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
          <div className="sticky top-20 z-40 bg-gray-50 pb-4 w-1/3">
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
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition"
                    >
                      {/* Image */}
                      <div className="relative h-[220px] w-full overflow-hidden">
                        {(() => {
                          const rooms = property.interior_rooms;
                          const roomsArray = Array.isArray(rooms)
                            ? rooms
                            : typeof rooms === "string"
                              ? JSON.parse(rooms)
                              : [];

                          return roomsArray && roomsArray.length > 0 ? (
                            <img
                              src={`https://ez-pay.realestway.com/${roomsArray[0]}`}
                              alt={property.typology}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200">
                              <Home className="h-14 w-14 text-gray-400" />
                            </div>
                          );
                        })()}

                        {/* Badge */}
                        <span className="absolute bottom-4 left-0 rounded-r-md bg-primary px-4 py-1 text-sm font-medium text-white">
                          {property.typology}
                        </span>
                      </div>

                      {/* Content */}
                      <CardContent className="p-5">
                        {/* Price */}
                        <p className="text-lg font-bold text-black">
                          {formatPrice(
                            (property.rent * 1.1) /
                              12 /
                              (property.no_of_units || 1),
                          )}
                          <span className="text-sm font-normal text-gray-500">
                            /month
                          </span>
                        </p>

                        {/* Title */}
                        <h3 className="mt-1 text-lg font-bold text-black">
                          {property.typology}, {property.area}
                        </h3>

                        {/* Location */}
                        <p className="text-sm text-gray-500">
                          {property.area}, {property.state}
                        </p>

                        {/* Icons */}
                        <div className="mt-4 flex items-center gap-5 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms} Beds</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{property.bathrooms} Bath</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            <span>2 Parking</span>
                          </div>
                        </div>

                        {/* Button */}
                        <Link
                          href={`/listings/${property.id}`}
                          className="mt-5 block"
                        >
                          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-primary py-3 text-primary font-medium transition hover:bg-primary hover:text-white">
                            View Property
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </Link>
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
