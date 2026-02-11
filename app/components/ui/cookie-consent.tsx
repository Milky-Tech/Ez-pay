"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_KEY = "ezpay_cookie_consent";

const setCookie = (name: string, value: string, days = 365) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value,
    )};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (err) {
    console.warn("Failed to set cookie:", err);
  }
};

const getCookie = (name: string) => {
  try {
    const nameEQ = encodeURIComponent(name) + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0)
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  } catch (err) {
    console.warn("Failed to read cookie:", err);
    return null;
  }
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookie = getCookie(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY);
    if (!cookie) setVisible(true);
  }, []);

  const accept = () => {
    setCookie(COOKIE_KEY, "accepted");
    try {
      localStorage.setItem(COOKIE_KEY, "accepted");
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    setCookie(COOKIE_KEY, "declined");
    try {
      localStorage.setItem(COOKIE_KEY, "declined");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-3xl w-[95%] md:w-auto">
      <div className="bg-white border shadow-lg rounded-lg px-4 py-3 flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1 text-sm text-gray-800">
          <strong>We use cookies</strong>
          <p className="mt-1 text-xs text-gray-600">
            We use cookies to improve your experience, analyze site usage, and
            provide personalized content. By clicking "Accept" you consent to
            our use of cookies. Manage preferences in your browser at any time.
          </p>
          <p className="mt-2 text-xs">
            <Link href="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={decline}
            className="px-3 py-2 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:opacity-95"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
