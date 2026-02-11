"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  heroImage?: string;
  heroTitle?: React.ReactNode;
  heroSubtitle?: string;
  formTitle: string;
  formSubtitle?: React.ReactNode;
  showSteps?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export default function AuthLayout({
  children,
  heroImage = "/images/authpic.jpg",
  heroTitle,
  heroSubtitle = "Experience the future of property rentals with verified listings and seamless payments.",
  formTitle,
  formSubtitle,
  showSteps = false,
  currentStep = 1,
  totalSteps = 2,
}: AuthLayoutProps) {
  return (
    <div className="max-h-screen flex flex-col md:flex-row bg-white overflow-hidden min-h-screen">
      {/* Left side - Hero Image and Text */}
      <div className="hidden md:flex md:w-[55%] rotate-360 relative items-center justify-center bg-gray-900 group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url("${heroImage}")`,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-12 lg:px-20 max-w-2xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-raleway text-white tracking-wider">
              EZ-Pay
            </span>
          </div>

          <div className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 drop-shadow-2xl">
            {heroTitle || (
              <>
                Join Thousands Finding their{" "}
                <span className="font-Redressed block text-[#C9A227] mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  Dream Homes
                </span>
              </>
            )}
          </div>
          <p className="text-white/80 text-lg lg:text-xl font-medium max-w-lg mb-8">
            {heroSubtitle}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center text-white/50 text-xs tracking-[0.2em] font-medium uppercase">
          <span>Intelligent Home EZ-Pay</span>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative bg-[#f8f9fa] overflow-y-auto">
        {/* Mobile Logo */}
        <div className="md:hidden mb-8 flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold font-raleway text-primary">
            EZ-Pay
          </span>
        </div>

        <div className="w-full max-w-md relative">
          <div className="absolute -top-24 -right-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

          <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 font-raleway mb-2">
                {formTitle}
              </h2>

              {formSubtitle && (
                <p className="text-gray-500 text-sm mt-1">{formSubtitle}</p>
              )}

              {showSteps && (
                <div className="flex gap-2 mt-4">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === currentStep
                          ? "w-12 bg-[#961f1f]"
                          : i + 1 < currentStep
                            ? "w-12 bg-[#961f1f]/60"
                            : "w-3 bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              )}
              {!showSteps && (
                <div className="flex gap-2 mt-4">
                  <div className="h-1.5 w-12 bg-[#961f1f] rounded-full" />
                  <div className="h-1.5 w-3 bg-gray-200 rounded-full" />
                </div>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
