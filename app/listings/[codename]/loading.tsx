import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#8B2323] mx-auto mb-4" />
        <p className="text-gray-500 font-montserrat">Loading property details...</p>
      </div>
    </div>
  );
}
