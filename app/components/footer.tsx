import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div>
      <section
        id="contact-us"
        className="relative w-full min-h-[480px] flex items-center"
        style={{
          backgroundImage: "url('/images/contactpic.jpg')", // ⬅ replace with your actual image src
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="max-w-xl text-white space-y-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
              Premium Homes. One <br /> Simple Monthly Payment.
            </h1>

            <p className="text-gray-200 text-sm sm:text-base">
              Access verified premium homes with guaranteed power, professional
              management, and a predictable monthly payment.
            </p>

            <button className="mt-4 bg-primary hover:bg-red-900 transition text-white px-6 py-3 rounded-full text-sm font-medium">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-black text-gray-400 flex flex-col">
        <div className="mx-auto w-[90%] py-14 flex justify-between sm:flex-row flex-col gap-10">
          {/* Brand / Newsletter */}
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-white font-semibold">
              <img
                src="/images/EZPAY-16.png"
                className="h-16 w-auto"
                alt="EZPAY Logo"
              />
            </div>

            <p className="text-sm md:max-w-xs">
              EZPAY helps you rent quality homes and pay monthly instead of
              yearly. Everything you need.
            </p>

            <div className="flex items-center bg-zinc-900 rounded-lg p-2 overflow-hidden border border-zinc-800">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent px-4 py-2 text-sm outline-none flex-1 text-white"
              />
              <button className="bg-primary hover:bg-red-900 transition text-white text-sm px-4 py-2 rounded-2xl mr-1">
                Subscribe
              </button>
            </div>
          </div>

          {/* For Renters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-medium mb-4">For Renters</h4>
              <ul className="space-y-3 text-sm flex flex-col">
                <Link
                  href={"/listings"}
                  className="hover:text-white cursor-pointer"
                >
                  View Properties
                </Link>
                <Link
                  href={"/about-us"}
                  className="hover:text-white cursor-pointer"
                >
                  How it Works
                </Link>
                <Link href={"#faq"} className="hover:text-white cursor-pointer">
                  FAQ
                </Link>
              </ul>
            </div>

            {/* For Landlords */}
            <div>
              <h4 className="text-white font-medium mb-4">For Landlords</h4>
              <ul className="space-y-3 text-sm flex flex-col">
                <Link
                  href={"/landlord-partner"}
                  className="hover:text-white cursor-pointer"
                >
                  Become a Partner
                </Link>
                <Link
                  href={"/landlord-partner"}
                  className="hover:text-white cursor-pointer"
                >
                  Partnership Tiers
                </Link>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-3 text-sm flex flex-col">
                <Link
                  href={"/about-us"}
                  className="hover:text-white cursor-pointer"
                >
                  About Us
                </Link>
                <Link
                  href={"/listing"}
                  className="hover:text-white cursor-pointer"
                >
                  Listing
                </Link>
                <Link
                  href={"#contact-us"}
                  className="hover:text-white cursor-pointer"
                >
                  Contact Us
                </Link>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Bridgent Homestep EZPAY. All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default Footer;
