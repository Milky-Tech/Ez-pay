"use client";

import Header from "@/app/components/header";
import Link from "next/link";
import { Button } from "../components/ui/button";
import FAQSection from "../components/ui/faq";
import Footer from "../components/footer";
import { Card, CardContent } from "../components/ui/card";
import { Home, LockIcon, Shield, Wallet, Zap } from "lucide-react";
import { use } from "react";

const AboutPage = () => {
  return (
    <>
      <div>
        <Header />
        <section className="relative h-[60vh] flex pb-2 pt-auto justify-center bg-[#000000] bg-transparent-[60%]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: "url('/images/aboutUs.jpg')",
            }}
          />
          <div className="relative z-10 w-full max-w-[96%] md:max-w-[70%] lg:max-w-1/3 mx-auto my-auto flex">
            <div className="px-6 md:px-12 text-center m-auto">
              <h1 className="text-5xl text-white">ABOUT US</h1>
            </div>
          </div>
        </section>
      </div>
      <section className="py-20 sm:mx-20 flex flex-col gap-5 sm:gap-8 sm:flex-row items-center sm:items-start">
        <div className="w-full sm:w-[50%] flex flex-col gap-10">
          <div className="max-w-3xl ml-20 sm:ml-0 w-32 px-2 sm:px-4 lg:px-6 bg-white shadow-lg shadow-primary/50 text-primary rounded-md py-2 text-center mb-6">
            ABOUT US
          </div>
          <h2 className="text-3xl">About EZ-Pay</h2>
          <span className="text-justify ml-8 sm:mx-auto text-gray-700 max-w-3xl mx-auto flex flex-col gap-4">
            <p>
              EZ-Pay is redefining how people rent homes by replacing the
              pressure of yearly rent with simple, predictable monthly payments.
              We believe quality living should be accessible without financial
              strain.{" "}
            </p>
            <p>
              Our platform connects renters to carefully verified, premium homes
              that meet high standards of comfort, security, and reliability.{" "}
            </p>
            <p>
              Every EZ-Pay home comes with guaranteed power, professional
              facility management, and transparent pricing, so there are no
              surprises.{" "}
            </p>
            <p>
              For landlords, EZ-Pay offers peace of mind through consistent
              monthly income and hands-off property management, while helping
              preserve and enhance long-term asset value.{" "}
            </p>
            <p>
              At EZ-Pay, we are building a better rental experience, one that
              prioritizes stability, dignity, and peace of mind for everyone
              involved.
            </p>
          </span>
          <div className="flex gap-4 mb-10 md:mb-12 pl-1">
            <Link href="/listings" className="w-[40%]">
              <Button
                size="lg"
                className="w-full bg-primary rounded-full text-sm md:text-base hover:bg-primary/90 text-white font-montserrat px-4 py-4 md:py-5"
              >
                View Listings
              </Button>
            </Link>
            <Link href="/landlord-partner" className="w-[40%]">
              <Button
                size="lg"
                className="w-full border-2 border-primary bg-transparent backdrop-blur-sm text-primary rounded-full hover:bg-primary/20 hover:text-white font-montserrat text-sm md:text-base px-4 py-3 md:py-5"
              >
                Become EZ-Partner
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 md:pt-3 border-t border-black/20">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl md:text-[35px] lg:text-[40px] font-bold">
                2500+
              </h2>
              <p className="text-[10px] md:text-xs text-[#888888] uppercase tracking-wider">
                Happy Home Owners
              </p>
            </div>
            <div className="hidden md:block border-l border-white/20 h-10"></div>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl md:text-[35px] lg:text-[40px] font-bold">
                4.8
              </h2>
              <p className="text-[10px] md:text-xs text-[#888888] uppercase tracking-wider">
                Avg Rating
              </p>
            </div>
            <div className="hidden md:block border-l border-white/20 h-10"></div>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl md:text-[35px] lg:text-[40px] font-bold">
                $10M+
              </h2>
              <p className="text-[10px] md:text-xs text-[#888888] uppercase tracking-wider">
                Homes Made Accessible
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-[50%] h-[800px]">
          <div
            style={{
              backgroundImage: "url('/images/aboutpic1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="mx-auto mt-8 w-full bg-cover h-[600px]"
          />
          <div
            style={{
              backgroundImage: "url('/images/aboutpic2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="mx-auto mt-8 w-full bg-cover h-[600px]"
          />
        </div>
      </section>
      <section className="py-20 sm:mx-20 flex flex-col gap-12">
        <div className="flex flex-col sm:flex-row justify-between mb-5">
          <div className="flex flex-col gap-0">
            <div className="w-44 ml-20 sm:ml-0 px-2 sm:px-4 lg:px-6 bg-white shadow-lg shadow-primary/50 text-primary rounded-md py-2 text-center mb-4">
              WHY CHOOSE US
            </div>
            <p className="text-4xl ml-8 sm:ml-0">
              Designed For Stability.{" "}
              <p className="text-primary">Built for Comfort.</p>
            </p>
          </div>{" "}
          <p className="text-gray-500 sm:w-1/2 text-xl text-left mx-8 sm:mx-0">
            We remove the stress of yearly rent by offering verified premium
            homes, predictable monthly payments, and reliable essentials.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 sm:px-0">
          <Card className="bg-primary/10 border-primary/20 hover:shadow-3xl shadow-xl transition-shadow shadow-black/10">
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
          <Card className="bg-white border-primary/20 hover:shadow-3xl shadow-xl transition-shadow shadow-black/10">
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
          <Card className="bg-white border-primary/20 hover:shadow-3xl shadow-xl transition-shadow shadow-black/10">
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
          <Card className="bg-white border-primary/20 hover:shadow-3xl shadow-xl transition-shadow shadow-black/10">
            <CardContent className="p-6 text-left">
              <div className="bg-white rounded-[15%] w-14 h-14 flex items-center justify-center ml-0 mx-auto mb-4 shadow-lg shadow-primary/30">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-raleway">
                All Inclusive Living
              </h3>
              <p className="text-gray-700">
                One monthly payment covers rent, power, and professional
                facility management — no hidden costs.
              </p>
            </CardContent>
          </Card>{" "}
          <Card className="bg-white border-primary/20 hover:shadow-3xl shadow-xl transition-shadow shadow-black/10">
            <CardContent className="p-6 text-left">
              <div className="bg-white rounded-[15%] w-14 h-14 flex items-center justify-center ml-0 mx-auto mb-4 shadow-lg shadow-primary/30">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-raleway">
                Property Management
              </h3>
              <p className="text-gray-700">
                Maintenance, utilities, and day-to-day issues are handled for
                you, so you can live stress-free.
              </p>
            </CardContent>
          </Card>{" "}
          <Card className="bg-white border-primary/20 hover:shadow-3xl shadow-xl transition-shadow shadow-black/10">
            <CardContent className="p-6 text-left">
              <div className="bg-white rounded-[15%] w-14 h-14 flex items-center justify-center ml-0 mx-auto mb-4 shadow-lg shadow-primary/30">
                <LockIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-raleway">
                Secure and Transparent
              </h3>
              <p className="text-gray-700">
                From inspections to payments and approvals, every step is clear,
                secure, and designed to protect you.
              </p>
            </CardContent>
          </Card>
        </div>
        <Button className="bg-primary text-white mx-auto w-32">
          <Link href="/listings">View Listings</Link>
        </Button>
      </section>
      <FAQSection />
      <Footer />
    </>
  );
};

export default AboutPage;
