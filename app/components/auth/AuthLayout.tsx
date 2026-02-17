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
  heroImage = "/images/auth-image.jpeg",
  heroTitle,
  heroSubtitle,
  formTitle,
  formSubtitle,
  showSteps = false,
  currentStep = 1,
  totalSteps = 2,
}: AuthLayoutProps) {
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-cover bg-center font-sans"
      style={{
        backgroundImage: `url("${heroImage}")`,
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 flex h-full w-full flex-col px-6 md:flex-row md:px-12 lg:px-20">
        
        {/* Left Side - Hero Text */}
        <div className="flex h-full w-full flex-col justify-center md:w-1/2">
          <div className="mt-12">
           
          <Link href="/">   <img src="/images/EZPAY-16.png" className="h-28 mb-6 pl-[-5px]" />       </Link>       
           

          <div className="mb-2 text-5xl font-bold leading-tight text-white drop-shadow-xl lg:text-5xl">
            {heroTitle || (
              <>
                Join Thousands <br />
                Finding their{" "}
                <span className="mt-2 block font-Redressed text-[#bf9b30]">
                  Dream Homes
                </span>
              </>
            )}
          </div>
          
           {heroSubtitle && (
            <p className="mb-1 max-w-lg text-base font-medium text-white/80 lg:text-lg">
              {heroSubtitle}
            </p>
          )}
          </div>
        </div>

        {/* Right Side - Glass Form */}
        <div className="flex h-full w-full items-center justify-center md:w-1/2 md:justify-end md:py-6">
          <div className="flex h-full max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md md:max-h-full md:rounded-[2rem]">
            <div className="flex h-full flex-col overflow-y-auto p-6 md:p-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
              <div className="mb-6">
                <h2 className="mb-1 font-raleway text-xl font-bold text-white lg:text-2xl">
                  {formTitle}
                </h2>

                {formSubtitle && (
                  <div className="text-sm text-gray-200">{formSubtitle}</div>
                )}

                {showSteps && (
                  <div className="mt-2 flex gap-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i + 1 === currentStep
                            ? "w-12 bg-[#961f1f]"
                            : i + 1 < currentStep
                              ? "w-12 bg-[#961f1f]/60"
                              : "w-3 bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="text-white my-3 flex-1 flex flex-col justify-center">
                {children}
              </div>
              
               <div className="mt-auto text-center text-xs text-gray-400">
                  <div className="flex justify-center gap-2">
                    <span>©Bridgent Home EZPay</span>
                    <span>|</span>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
