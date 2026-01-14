"use client";

import { Button } from "@/app/components/ui/button";

interface PropertyFilterProps {
  maxPrice: number;
  setMaxPrice: (value: number) => void;
}

const MAX_PRICE = 2_000_000;

export default function PropertyFilter({
  maxPrice,
  setMaxPrice,
}: PropertyFilterProps) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <div className="flex flex-col gap-4">
        {/* Label */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Max Monthly Price
          </label>
          <span className="text-sm font-semibold text-primary">
            ₦{maxPrice.toLocaleString()}
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={100000}
          max={MAX_PRICE}
          step={100000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer
                     bg-gray-200 accent-primary"
        />

        {/* Min / Max */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>₦100,000</span>
          <span>₦{MAX_PRICE.toLocaleString()}</span>
        </div>

        {/* Reset */}
        <Button
          variant="outline"
          className="w-fit self-end"
          onClick={() => setMaxPrice(0)}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
