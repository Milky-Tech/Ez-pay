import { AuthProvider } from "@/context/authcontext";
import { AIProvider } from "@/context/aicontext";
import "./globals.css";
import type { Metadata } from "next";
import { Raleway, Open_Sans, Montserrat, Great_Vibes } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Bridgent HomeStep EZ-Pay - Your Path to Monthly Living",
  description:
    "End the stress of upfront yearly rent. Access verified, high-end homes with guaranteed power and predictable monthly payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${openSans.variable} ${montserrat.variable} ${greatVibes.variable}`}
    >
      <body className="font-open-sans antialiased">
        <AuthProvider>
          <AIProvider>{children}</AIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
