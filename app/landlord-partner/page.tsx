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
import {
  CheckCircle,
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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Footer from "../components/footer";

export default function LandlordPartnerPage() {
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
              EZ-PAY LANDLORD
            </h1>
          </div>
        </div>
      </section>

      <div className="pt-4 pb-12">
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
                    EZ-Prime Landlord
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
                    EZ-Vantage Landlord
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

          <Card className="mb-12">
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

          {/* CTA Section */}
          <section className="py-16 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A227]/5 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <div className="relative z-10 px-8 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-raleway">
                Ready to Become an EZ-PAY Landlord?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join our exclusive network of property owners. Start your journey towards 
                hassle-free property management and guaranteed rental income today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/landlord/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-16 px-10 bg-[#961f1f] hover:bg-[#7a1a1a] text-white text-xl font-bold rounded-2xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-3 group">
                    Become a Landlord
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/about" className="text-gray-600 font-semibold hover:text-primary transition-colors">
                  Learn more about our standards
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
