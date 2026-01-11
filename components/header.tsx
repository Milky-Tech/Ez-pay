"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Building2,
  HelpCircle,
  Menu,
  X,
  User,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { isAuthenticated, user } = useAuth();

  return (
    <header
      className={`fixed w-[100%] top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-primary shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-[92%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between max-w-[100%] items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center">
              {/* <Home
                className={`h-8 w-8 ${
                  isScrolled ? "text-gray-800" : "text-primary"
                }`}
              /> */}
              <span
                className={`ml-2 text-xl font-bold font-raleway ${
                  isScrolled ? "text-white" : "text-primary"
                }`}
              >
                <img src="/images/logo-ezpay.png" alt="Logo" className="h-8" />
                {/* <span className="text-accent">Bridgent</span> HomeStep EZ-Pay */}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <Link
              href="/about"
              className={`font-montserrat transition-colors ${
                isScrolled
                  ? "text-white hover:text-accent"
                  : "text-white hover:text-primary"
              }`}
            >
              About Us
            </Link>{" "}
            <Link
              href="/listings"
              className={`font-montserrat transition-colors ${
                isScrolled
                  ? "text-white hover:text-accent"
                  : "text-white hover:text-primary"
              }`}
            >
              Listings
            </Link>
            <Link
              href="/landlord-partner"
              className={`font-montserrat transition-colors ${
                isScrolled
                  ? "text-white hover:text-accent"
                  : "text-white hover:text-primary"
              }`}
            >
              Landlord
            </Link>
            <Link
              href="/faq"
              className={`font-montserrat transition-colors ${
                isScrolled
                  ? "text-white hover:text-accent"
                  : "text-white hover:text-primary"
              }`}
            >
              FAQ
            </Link>
            {isAuthenticated ? (
              <Link
                href={
                  user?.role === "admin"
                    ? "/admin"
                    : user?.role === "landlord"
                    ? "/landlord"
                    : "/profile"
                }
              >
                <Button
                  variant={isScrolled ? "secondary" : "default"}
                  size="sm"
                  className="font-montserrat"
                >
                  <User />
                </Button>
              </Link>
            ) : (
              <Link href="/signin">
                <Button
                  variant={isScrolled ? "secondary" : "default"}
                  size="sm"
                  className="font-montserrat"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? "text-white" : "text-primary"} />
            ) : (
              <Menu className={isScrolled ? "text-white" : "text-primary"} />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-white shadow-lg rounded-lg mt-2">
            <nav className="flex flex-col space-y-4 px-4">
              <Link
                href="/listings"
                className="font-montserrat text-gray-800 hover:text-primary"
              >
                Listings
              </Link>
              <Link
                href="/landlord-partner"
                className="font-montserrat text-gray-800 hover:text-primary"
              >
                Landlord
              </Link>
              <Link
                href="/about"
                className="font-montserrat text-gray-800 hover:text-primary"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="font-montserrat text-gray-800 hover:text-primary"
              >
                FAQ
              </Link>
              {isAuthenticated ? (
                <Link
                  href={
                    user?.role === "admin"
                      ? "/admin"
                      : user?.role === "landlord"
                      ? "/landlord"
                      : "/profile"
                  }
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="font-montserrat w-full"
                  >
                    <User />
                  </Button>
                </Link>
              ) : (
                <Link href="/signin">
                  <Button
                    variant="default"
                    size="sm"
                    className="font-montserrat w-full"
                  >
                    Sign In <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
