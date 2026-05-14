import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Apartment | Ez-pay",
  description: "Complete your rental application for your desired apartment.",
};

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Apply for Apartment</h1>
        <p className="text-gray-600 mb-8">Please select a property from the listings page to start your application.</p>
        <a href="/listings" className="inline-block bg-[#8B2323] text-white px-8 py-3 rounded-full font-bold transition-all hover:bg-[#721c1c]">
          View Listings
        </a>
      </div>
    </div>
  );
}
