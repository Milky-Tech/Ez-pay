import React from "react";
import { User, Menu } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AdminHeaderProps {
  title: string;
  userName: string;
  onMenuClick?: () => void;
}

export default function AdminHeader({
  title,
  userName,
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <h2 className="text-xl font-bold text-gray-800 capitalize">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <div className="bg-primary/10 p-1 rounded-full">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
