"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import AuthLayout from "@/app/components/auth/AuthLayout";

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, message, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout
      formTitle="Log in to your account"
    >
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

      <div className="grid grid-cols-2 gap-4 mb-4">
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

      <p className="text-center text-gray-600 text-sm mt-8">
        Don't have an account?{" "}
        <Link href="/landlord/signup" className="text-[#961f1f] font-bold hover:underline">
          Sign up as Landlord
        </Link>
      </p>
    </AuthLayout>
  );
}
