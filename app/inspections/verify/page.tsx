"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Home } from "lucide-react";
import { useAuth } from "@/context/authcontext";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus("error");
        setMessage("No payment reference found.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/inspections/verify?reference=${reference}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your inspection has been successfully booked!");
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("A network error occurred. Please check your connection.");
      }
    };

    if (token) {
      verifyPayment();
    }
  }, [reference, token]);

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-raleway font-bold text-primary">
            Payment Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-8 space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-gray-600 text-center font-medium">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-gray-800">Success!</p>
                <p className="text-gray-600">{message}</p>
              </div>
              <Link href="/listings" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Listings
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-gray-800">Verification Failed</p>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
                <Link href="/listings" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Return to Listings
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-32 pb-12 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        }>
          <VerificationContent />
        </Suspense>
      </div>
    </div>
  );
}
