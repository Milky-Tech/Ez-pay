"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Home,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, message, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "landlord") {
        router.push("/landlord");
      } else {
        router.push("/profile");
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (message) {
      setError(message);
    }
  }, [message]);

  const handleSignIn = async (e: React.FormEvent) => {
    setError("");
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left side - Hero Image and Text */}
      <div className="hidden md:flex md:w-[55%] relative items-center justify-center bg-gray-900 group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: 'url("/images/authpic.jpg")',
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

          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 drop-shadow-2xl">
            Join Thousands Finding their{" "}
            <span className="font-Redressed block text-[#C9A227] mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Dream Homes
            </span>
          </h1>
          <p className="text-white/80 text-lg lg:text-xl font-medium max-w-lg mb-8">
            Experience the future of property rentals with verified listings and
            seamless payments.
          </p>

          <div className="flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform"
                >
                  <img
                    src={`https://i.pravatar.cc/100?u=${i}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-white">
              <p className="text-sm font-bold">10k+ Families</p>
              <p className="text-xs text-white/60">Trust EZ-Pay daily</p>
            </div>
          </div>
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

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative bg-[#f8f9fa]">
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
                Create your account
              </h2>
              <p className="text-gray-500 font-medium">
                Log in to find your perfect home.
              </p>

              <div className="flex gap-2 mt-4">
                <div className="h-1.5 w-12 bg-[#961f1f] rounded-full" />
                <div className="h-1.5 w-3 bg-gray-200 rounded-full" />
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 font-semibold ml-1"
                >
                  Email Address *
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-semibold"
                  >
                    Password *
                  </Label>
                  <Link
                    href="/forgot-password"
                    size="sm"
                    className="text-[#961f1f] text-sm font-bold hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#961f1f] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 h-14 bg-white border-gray-200 focus:border-[#961f1f] focus:ring-[#961f1f] rounded-xl transition-all"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium text-gray-600 cursor-pointer"
                >
                  By clicking, and creating an account, I agree to EZ-Pay&apos;s
                  Terms of Use and Privacy Policy
                </Label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
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
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase px-4">
                <span className="bg-transparent text-gray-400 font-bold tracking-widest">
                  Or
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="h-5 w-5"
                  alt="Google"
                />
                <span className="text-sm font-bold text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 h-12 bg-black rounded-xl hover:bg-gray-900 transition-colors shadow-lg">
                <img
                  src="https://www.svgrepo.com/show/303102/apple-black-logo.svg"
                  className="h-5 w-5 invert"
                  alt="Apple"
                />
                <span className="text-sm font-bold text-white">Apple</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
