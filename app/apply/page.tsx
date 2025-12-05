// app/apply/[codename]/page.tsx - Simplified version
"use client";

import { Suspense } from "react";
import RentalApplicationPage from "./[codename]/page";

export default function RentalApplication() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      }
    >
      <RentalApplicationPage />
    </Suspense>
  );
}
