"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Home,
  ShieldCheck,
  CheckCircle,
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
  // Show error message from AuthContext when it changes
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

  // Handle social sign-in (if needed)
  const handleSocialSignIn = (provider: string) => {
    // Redirect to OAuth provider
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <Link href="/" className="inline-block mb-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-raleway text-primary">
              EZ-Pay
            </span>
          </div>
        </Link>
        <p className="text-gray-600 font-open-sans text-sm">
          Sign in to access premium homes
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium font-open-sans">
                  {successMessage}
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-green-600 text-sm hover:text-green-800 font-open-sans mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-raleway text-primary">
            Welcome Back
          </CardTitle>
          <CardDescription className="font-open-sans">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Social Sign In (Optional - keep if you have OAuth) */}
          {/* <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full font-montserrat"
              onClick={() => handleSocialSignIn("google")}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full font-montserrat"
              onClick={() => handleSocialSignIn("apple")}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.36 3.74 7.29 9.08 6.61c1.15-.13 2.08.74 3.04.74.96 0 2.27-.9 3.81-.78.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.27-2.15 3.81.03 3.02 2.65 4.04 2.66 4.04-.01.07-.42 1.44-1.38 2.88M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
              Continue with Apple
            </Button>
          </div> */}

          {/* Divider - Only show if you have social buttons */}
          {/* <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-open-sans">
                Or sign in with email
              </span>
            </div>
          </div> */}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-montserrat text-sm">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="pl-10 font-open-sans"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(""); // Clear error when user types
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-montserrat text-sm">
                  Password *
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-montserrat"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 font-open-sans"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(""); // Clear error when user types
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-open-sans text-gray-600 cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0">
                    !
                  </div>
                  <p className="text-red-600 text-sm font-open-sans">{error}</p>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 font-montserrat py-3 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Info (for development) */}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <div className="text-center font-open-sans text-sm text-gray-600">
            New to EZ-Pay?{" "}
            <Link
              href="/signup"
              className="text-primary font-semibold hover:underline font-montserrat"
            >
              Create an account
            </Link>
          </div>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-primary font-open-sans"
            >
              ← Back to homepage
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Security Footer */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-open-sans">
          <ShieldCheck className="h-3 w-3" />
          <span>Secure sign-in with SSL encryption</span>
        </div>
      </div>
    </div>
  );
}
