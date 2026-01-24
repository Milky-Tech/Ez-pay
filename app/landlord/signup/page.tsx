"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import AuthLayout from "@/app/components/auth/AuthLayout";
import Link from "next/link";

const API_BASE_URL = "https://ez-pay.realestway.com/api";

export default function LandlordSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Signup, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError("");
  };

  // Step 1: Handle Registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/landlords`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to signin
        router.push("/signin?signup=success");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setCountdown(60);
        setCanResend(false);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  return (
    <AuthLayout
      heroTitle={
        <>
          Secure your asset with{" "}
          <span className="font-Redressed block text-[#C9A227] mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            EZ-Pay Landlord
          </span>
        </>
      }
      formTitle={step === 1 ? "Create your account" : "OTP Code"}
      formSubtitle={
        step === 1 ? (
          "Sign up to partner with us"
        ) : (
          `We've sent a 6-digit code to ${formData.email}`
        )
      }
      showSteps={true}
      currentStep={step}
      totalSteps={2}
    >
      {step === 1 ? (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-gray-700 font-semibold ml-1">
              Full Name *
            </Label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
              <Input
                id="full_name"
                placeholder="Enter your full name"
                className="pl-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold ml-1">
              Email Address *
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="pl-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-semibold ml-1">
              Phone Number *
            </Label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
              <Input
                id="phone"
                placeholder="Enter your phone number"
                className="pl-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="password" className="text-gray-700 font-semibold ml-1">
              Password *
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-12 pr-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password_confirmation"
              className="text-gray-700 font-semibold ml-1"
            >
              Confirm Password *
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
              <Input
                id="password_confirmation"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-12 pr-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                !
              </div>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 bg-[#961f1f] hover:bg-[#7a1a1a] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/10 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Proceed <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#961f1f] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-center sm:justify-between gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                className="h-12 w-10 sm:h-16 sm:w-16 text-center text-xl sm:text-2xl font-bold border-2 focus:border-[#961f1f] focus:ring-0 rounded-xl transition-all"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && index > 0) {
                    const prevInput = document.getElementById(`otp-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
                required
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                !
              </div>
              {error}
            </div>
          )}

          <div className="text-center space-y-4">
            <Button
              type="submit"
              className="w-full h-14 bg-[#961f1f] hover:bg-[#7a1a1a] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/10 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Verify OTP <CheckCircle className="h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-gray-600 text-sm">
              Didn't get a code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#961f1f] font-bold hover:underline focus:outline-none"
                >
                  Click to Resend
                </button>
              ) : (
                <span className="text-gray-400 font-medium">
                  Resend in {countdown}s
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-gray-500 text-sm font-medium hover:text-gray-700"
            >
              ← Back to registration
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
