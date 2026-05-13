import { AuthProvider } from "@/context/authcontext";
import { AIProvider } from "@/context/aicontext";
import GoogleProvider from "@/app/components/providers/GoogleProvider";
import "./globals.css";
import type { Metadata } from "next";
import { Raleway, Open_Sans, Montserrat, Great_Vibes, Redressed } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

const redressed = Redressed({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-redressed",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bridgent HomeStep EZPAY - Rent Verified Homes Monthly in Nigeria",
    template: "%s | Ez-pay"
  },
  description:
    "Stop paying upfront yearly rent. Access verified, high-end homes in Lagos, Abuja, and beyond with guaranteed power and predictable monthly payments. The easiest way to rent in Nigeria.",
  keywords: ["monthly rent Nigeria", "rent pay monthly Lagos", "verified homes for rent", "no upfront rent", "Bridgent Ez-pay", "property financing Nigeria"],
  authors: [{ name: "Bridgent Homes" }],
  creator: "Bridgent Homes",
  publisher: "Bridgent Homes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/EZPAY-15.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/images/EZPAY-15.png", sizes: "any", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Bridgent HomeStep EZPAY - Rent Verified Homes Monthly in Nigeria",
    description:
      "Access verified, high-end homes with guaranteed power. Predictable monthly payments, no upfront yearly rent stress.",
    url: "https://ezpay.bridgenthomes.com",
    siteName: "EZPAY",
    images: [
      {
        url: "/images/EZPAY-15.png",
        width: 1200,
        height: 630,
        alt: "Ez-pay - Your Path to Monthly Living",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridgent HomeStep EZPAY - Rent Verified Homes Monthly",
    description:
      "Stop paying upfront yearly rent. Access verified, high-end homes with guaranteed power and monthly payments.",
    images: ["/images/EZPAY-15.png"],
    creator: "@bridgenthomes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { Toaster } from "@/app/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${openSans.variable} ${montserrat.variable} ${greatVibes.variable} ${redressed.variable}`}
    >
      <body className="font-open-sans antialiased">
        <GoogleProvider>
          <AuthProvider>
            <AIProvider>
              {children}
            </AIProvider>
          </AuthProvider>
        </GoogleProvider>
        <Toaster />
      </body>
    </html>
  );
}
