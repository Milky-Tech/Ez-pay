'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Building2, HelpCircle, Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center">
              <Home className={`h-8 w-8 ${isScrolled ? 'text-white' : 'text-primary'}`} />
              <span className={`ml-2 text-xl font-bold font-raleway ${isScrolled ? 'text-white' : 'text-primary'}`}>
                <span className="text-accent">Bridgent</span> HomeStep EZ-Pay
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/listings"
              className={`font-montserrat transition-colors ${
                isScrolled ? 'text-white hover:text-accent' : 'text-gray-800 hover:text-primary'
              }`}
            >
              Listings
            </Link>
            <Link
              href="/landlord-partner"
              className={`font-montserrat transition-colors ${
                isScrolled ? 'text-white hover:text-accent' : 'text-gray-800 hover:text-primary'
              }`}
            >
              Landlord
            </Link>
            <Link
              href="/about"
              className={`font-montserrat transition-colors ${
                isScrolled ? 'text-white hover:text-accent' : 'text-gray-800 hover:text-primary'
              }`}
            >
              About
            </Link>
            <Link
              href="/faq"
              className={`font-montserrat transition-colors ${
                isScrolled ? 'text-white hover:text-accent' : 'text-gray-800 hover:text-primary'
              }`}
            >
              FAQ
            </Link>
            <Link href="/admin">
              <Button variant={isScrolled ? 'secondary' : 'default'} size="sm" className="font-montserrat">
                Admin
              </Button>
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? 'text-white' : 'text-primary'} />
            ) : (
              <Menu className={isScrolled ? 'text-white' : 'text-primary'} />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-white shadow-lg rounded-lg mt-2">
            <nav className="flex flex-col space-y-4 px-4">
              <Link href="/listings" className="font-montserrat text-gray-800 hover:text-primary">
                Listings
              </Link>
              <Link href="/landlord-partner" className="font-montserrat text-gray-800 hover:text-primary">
                Landlord
              </Link>
              <Link href="/about" className="font-montserrat text-gray-800 hover:text-primary">
                About
              </Link>
              <Link href="/faq" className="font-montserrat text-gray-800 hover:text-primary">
                FAQ
              </Link>
              <Link href="/admin">
                <Button variant="default" size="sm" className="font-montserrat w-full">
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
