import Link from "next/link";
import Header from "@/components/header";
import ChatWidget from "@/components/chat-widget";
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

export default function LandingPage() {
  return (
    <div className="min-h-screen w-[100%]">
      <Header />
      <ChatWidget />

      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          }}
        />
        <div className="relative z-10 max-w-[96%] md:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl border-2 border-accent shadow-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 font-raleway">
              Your Path to Monthly Living
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-primary mb-4">
              End the Stress of Upfront Yearly Rent
            </p>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Access verified, high-end homes with guaranteed 15+ hours of power
              and a predictable monthly payment structure. Welcome to House
              Serenity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-montserrat text-lg px-8 py-8"
                >
                  View Available Premium <br /> Homes
                </Button>
              </Link>
              <Link href="/landlord-partner">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-montserrat text-lg px-8 py-6"
                >
                  Become an EZ-Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4 font-raleway">
              EZ-Client: Stability Meets Luxury
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Eliminate the annual liquidity trap. Our all-inclusive monthly fee
              covers rent, facility management, and guaranteed power.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-secondary/10 border-secondary/20 hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3 font-raleway">
                  Monthly Payments
                </h3>
                <p className="text-gray-700">
                  Pay rent monthly instead of the traditional annual payment. No
                  more financial strain.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/20 hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3 font-raleway">
                  Guaranteed Power
                </h3>
                <p className="text-gray-700">
                  Every property guarantees 15+ hours of power daily with
                  solar/inverter systems.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/20 hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3 font-raleway">
                  Premium Quality
                </h3>
                <p className="text-gray-700">
                  Only verified high-end properties that meet our strict ACCESSS
                  Standard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-raleway">
              EZ-Partner: Predictable Income. Zero Management Burden
            </h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              Stop chasing rent and maintenance calls. We guarantee consistent
              monthly income and elevate your asset value.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-raleway text-white">
                  Consistent Income
                </h3>
                <p className="opacity-90 text-white">
                  Guaranteed monthly payments directly to your account. No more
                  chasing tenants.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl text-white font-semibold mb-3 font-raleway">
                  Zero Management
                </h3>
                <p className="opacity-90 text-white">
                  We handle all property management, maintenance, and tenant
                  relations.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-raleway text-white">
                  Asset Elevation
                </h3>
                <p className="opacity-90 text-white">
                  We upgrade your property to premium standards, increasing its
                  long-term value.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Link href="/landlord-partner">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-primary font-montserrat text-lg px-8 py-6"
              >
                Learn More About Partnership
              </Button>
            </Link>
          </div>
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
