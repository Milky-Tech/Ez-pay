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
  title: "Bridgent HomeStep EZPAY - Your Path to Monthly Living",
  description:
    "End the stress of upfront yearly rent. Access verified, high-end homes with guaranteed power and predictable monthly payments.",
  icons: {
    icon: [
      { url: "/images/EZPAY-15.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/images/EZPAY-15.png", sizes: "any", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Bridgent HomeStep EZPAY",
    description:
      "Your Path to Monthly Living. Access verified, high-end homes with guaranteed power.",
    url: "https://ezpay.bridgenthomes.com",
    siteName: "EZPAY",
    images: [
      {
        url: "/images/EZPAY-15.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridgent HomeStep EZPAY",
    description:
      "Your Path to Monthly Living. Access verified, high-end homes with guaranteed power.",
    images: ["/images/EZPAY-15.png"],
  },
};

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
      </body>
    </html>
  );
}
