"use client";

import Link from "next/link";
import Header from "@/components/header";
import ChatWidget from "@/components/ui/chat-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    img: "/images/slide1.png",
    title: "Zero Management",
    desc: "We handle all property management, maintenance, and tenant relations.",
  },
  {
    img: "/images/slide2.jpg",
    title: "Consistent Income",
    desc: "Guaranteed monthly payments directly to your account. No more chasing tenants.",
  },
  {
    img: "/images/slide3.png",
    title: "Asset Evaluation",
    desc: "We upgrade your property to premium standards, increasing its long-term value.",
  },
];
export default function LandingPage() {
  const [active, setActive] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-[100%]">
      <Header />
      <ChatWidget />

      <section className="relative h-screen flex pb-2 pt-auto justify-center bg-[#000000] bg-transparent-[60%]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/bg.jpg')",
          }}
        />
        <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] lg:max-w-1/3 mx-auto md:ml-8 sm:pb-2 md:pb-4 sm:mb-0 sm:mt-auto my-auto pt-auto flex flex-col justify-end">
          <div className="px-6 md:px-12 text-left">
            <span className="flex gap-3 items-center mb-4 sm:mb-2">
              <img
                src="/images/group.png"
                alt="group tenants"
                className="h-4 md:h-5"
              />
              <span className="text-[#FFFFFF] text-[12px] font-[500]">
                End the Stress of Upfront Payment
              </span>
            </span>
            <h1 className="text-4xl md:text-[42px] lg:text-[53px] font-bold text-white mb-6 md:mb-4 font-raleway leading-tight md:leading-[1.2]">
              <b>YOUR PATH TO</b>
              <br />
              <b className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] via-[#f1d57c] to-[#C9A227] bg-[length:200%_auto] animate-shimmer">
                MONTHLY LIVING.
              </b>
            </h1>

            <p className="text-sm md:text-base text-white mb-8 md:mb-6 max-w-2xl">
              Access verified, high-end homes with guaranteed 15+ hours of power
              and a predictable monthly payment structure. Welcome to House
              Serenity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-12">
              <Link href="/listings" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary rounded-[18px] text-sm md:text-lg hover:bg-primary/90 text-white font-montserrat px-6 py-6 md:py-7"
                >
                  Rent A Home
                </Button>
              </Link>
              <Link href="/landlord-partner" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto border-2 border-primary/50 bg-primary/20 backdrop-blur-sm text-white rounded-[18px] hover:bg-secondary hover:text-white font-montserrat text-sm md:text-lg px-6 py-5 md:py-7"
                >
                  Become EZ-Partner
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 md:pt-6 border-t border-white/20">
              <div className="flex flex-col gap-1 text-white">
                <h2 className="text-2xl md:text-[35px] lg:text-[40px] font-bold">
                  2500+
                </h2>
                <p className="text-[10px] md:text-xs text-[#888888] uppercase tracking-wider">
                  Happy Home Owners
                </p>
              </div>
              <div className="hidden md:block border-l border-white/20 h-10"></div>
              <div className="flex flex-col gap-1 text-white">
                <h2 className="text-2xl md:text-[35px] lg:text-[40px] font-bold">
                  4.8
                </h2>
                <p className="text-[10px] md:text-xs text-[#888888] uppercase tracking-wider">
                  Avg Rating
                </p>
              </div>
              <div className="hidden md:block border-l border-white/20 h-10"></div>
              <div className="flex flex-col gap-1 text-white">
                <h2 className="text-2xl md:text-[35px] lg:text-[40px] font-bold">
                  $10M+
                </h2>
                <p className="text-[10px] md:text-xs text-[#888888] uppercase tracking-wider">
                  Homes Made Accessible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 sm:mx-20 flex flex-col">
        <div className="max-w-3xl ml-20 sm:ml-0 w-32 px-2 sm:px-4 lg:px-6 bg-white shadow-lg shadow-primary/50 text-primary rounded-md py-2 text-center mb-12">
          ABOUT US
        </div>
        <p className="text-left sm:text-center ml-8 sm:mx-auto text-gray-700 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl">
          EZ-Pay{" "}
          <span className="text-gray-500">
            makes premium living more accessible by replacing yearly rent with
            simple monthly payments.
          </span>{" "}
          We combine verified homes, guaranteed power, and professional
          management{" "}
          <span className="text-gray-500">to deliver stress-free living.</span>
        </p>
        <div
          style={{
            backgroundImage: "url('/images/about-keys.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="mx-auto mt-8 w-full bg-cover h-[600px]"
        />
      </section>
      <section className="py-20 sm:mx-20 flex flex-col gap-12">
        <div className="flex flex-col sm:flex-row justify-between mb-5">
          <div className="flex flex-col gap-0">
            <div className="max-w-3xl ml-20 sm:ml-0 w-32 px-2 sm:px-4 lg:px-6 bg-white shadow-lg shadow-primary/50 text-primary rounded-md py-2 text-center mb-4">
              EZ-CLIENT
            </div>
            <p className="text-4xl ml-8 sm:ml-0">
              Stability Meets <span className="text-primary">Luxury.</span>
            </p>
          </div>{" "}
          <p className="text-gray-500 sm:w-1/2 text-xl sm:text-center text-left mx-8 sm:mx-0">
            Eliminate the annual liquidity trap. Our all-inclusive monthly fee
            covers rent, facility management, and guaranteed power.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 sm:px-0">
          <Card className="bg-primary/10 border-primary/20 hover:shadow-xl transition-shadow shadow-black/10">
            <CardContent className="p-6 text-left">
              <div className="bg-white rounded-[15%] w-14 h-14 flex items-center justify-center ml-0 mx-auto mb-4 shadow-lg shadow-primary/30">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-raleway">
                Monthly Payments
              </h3>
              <p className="text-gray-700">
                Pay rent monthly instead of the traditional annual payment. No
                more financial strain.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 hover:shadow-xl transition-shadow shadow-black/10">
            <CardContent className="p-6 text-left">
              <div className="bg-white rounded-[15%] w-14 h-14 flex items-center justify-center ml-0 mx-auto mb-4 shadow-lg shadow-primary/30">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-raleway">
                Guaranteed Power
              </h3>
              <p className="text-gray-700">
                Every property guarantees 20+ hours of power daily with
                solar/inverter systems.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 hover:shadow-xl transition-shadow shadow-black/10">
            <CardContent className="p-6 text-left">
              <div className="bg-white rounded-[15%] w-14 h-14 flex items-center justify-center ml-0 mx-auto mb-4 shadow-lg shadow-primary/30">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-raleway">
                Premium Quality
              </h3>
              <p className="text-gray-700">
                Only verified high-end properties that meet our strict ACCESSS
                Standard.
              </p>
            </CardContent>
          </Card>
        </div>
        <Button className="bg-primary text-white mx-auto w-32">
          <Link href="/listings">View Listings</Link>
        </Button>
      </section>

      <section className="py-10 sm:px-20 flex flex-col gap-12">
        <div className="flex flex-col gap-3 items-center text-center">
          <div className="bg-white shadow-lg shadow-primary/50 text-primary rounded-md py-2 px-6 mb-4">
            EZ-LANDLORD
          </div>

          <h2 className="text-4xl font-semibold">
            Predictable Income Zero Management Burden
          </h2>

          <p className="text-gray-500 max-w-xl">
            Stop chasing rent and maintenance calls. We guarantee consistent
            monthly income and elevate your asset value.
          </p>
        </div>

        {/* //slider */}
        <div className="flex items-center justify-center gap-8 overflow-hidden">
          {slides.map((slide, index) => {
            const isActive = index === active;

            return (
              <div
                key={index}
                className={`
          relative transition-all duration-700 ease-in-out sm:rounded-lg overflow-hidden
          
          /* MOBILE */
          ${isActive ? "block w-full" : "hidden"}
          sm:block

          /* DESKTOP */
          ${
            isActive
              ? "sm:scale-105 sm:z-20 sm:w-[420px]"
              : "sm:scale-90 sm:opacity-90 sm:w-[320px]"
          }
        `}
              >
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="object-cover w-full h-[260px]"
                />

                {/* CONTENT OVERLAY */}
                {isActive && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">
                      {slide.title}
                    </h3>
                    <p className="text-sm opacity-90">{slide.desc}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Link href={"/landlord-partner"}>
            <button className="bg-primary text-white px-8 py-3 rounded-full">
              Learn More
            </button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-raleway">
                Bridgent HomeStep EZ-Pay
              </h3>
              <p className="text-gray-400 text-sm">
                Legacy. Exclusivity. Stability. Premium Financial Empowerment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-montserrat">
                For Renters
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/listings" className="hover:text-accent">
                    View Properties
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-accent">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-accent">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-montserrat">
                For Landlords
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/landlord-partner" className="hover:text-accent">
                    Become a Partner
                  </Link>
                </li>
                <li>
                  <Link href="/partnership-tiers" className="hover:text-accent">
                    Partnership Tiers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-montserrat">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-accent">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-accent">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-accent">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Bridgent HomeStep EZ-Pay. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
