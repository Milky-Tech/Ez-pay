"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#1E90FF] hover:bg-[#187BCD] text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
        aria-label="Chat with us"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="bg-primary text-white p-4 rounded-t-lg">
            <h3 className="font-montserrat font-semibold">Chat with us</h3>
            <p className="text-sm opacity-90">How can we help you today?</p>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-sm">
                Welcome to Bridgent HomeStep EZ-Pay! Are you looking to:
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-montserrat text-sm"
              >
                View Available Properties
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-montserrat text-sm"
              >
                List My Property
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-montserrat text-sm"
              >
                Check Application Status
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-montserrat text-sm"
              >
                Other Inquiries
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
