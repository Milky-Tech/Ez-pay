import React from "react";
import { User, Menu, RefreshCw, Bell, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AdminHeaderProps {
  title: string;
  userName: string;
  onMenuClick?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const tabLabels: Record<string, { label: string; sub: string }> = {
  overview: { label: "Overview", sub: "Dashboard at a glance" },
  listings: { label: "Properties", sub: "Manage all listings" },
  applications: { label: "Applications", sub: "Tenant applications" },
  users: { label: "Users", sub: "Registered accounts" },
  landlords: { label: "Landlords", sub: "Partner landlords" },
};

export default function AdminHeader({
  title,
  userName,
  onMenuClick,
  onRefresh,
  isRefreshing = false,
}: AdminHeaderProps) {
  const tab = tabLabels[title] || { label: title, sub: "" };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:bg-slate-100"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-lg font-bold text-slate-900 capitalize font-raleway leading-none">
            {tab.label}
          </h2>
          {tab.sub && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-none">{tab.sub}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}

        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#9A2A2A] rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9A2A2A] to-[#6b1d1d] flex items-center justify-center shadow-sm shadow-[#9A2A2A]/30">
            <span className="text-white text-xs font-black">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none max-w-[120px] truncate">
              {userName}
            </p>
            <p className="text-[10px] text-[#9A2A2A] font-medium mt-0.5 leading-none flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
