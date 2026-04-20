import React from "react";
import Image from "next/image";
import {
  Users,
  FileText,
  UserCheck,
  Building2,
  LogOut,
  LayoutDashboard,
  Home,
  Calendar,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onClose?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  onClose,
}: SidebarProps) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard summary",
    },
    {
      id: "listings",
      label: "Properties",
      icon: Building2,
      description: "Manage listings",
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      description: "Tenant requests",
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      description: "Registered users",
    },
    {
      id: "landlords",
      label: "Landlords",
      icon: UserCheck,
      description: "Partner landlords",
    },
    {
      id: "schedules",
      label: "Schedules",
      icon: Calendar,
      description: "Inspection configs",
    },
    {
      id: "inspections",
      label: "Inspections",
      icon: Calendar,
      description: "Booked inspections",
    },
    {
      id: "offices",
      label: "Offices",
      icon: Home,
      description: "Manage offices",
    },
  ];

  return (
    <div className="flex flex-col w-full md:w-64 bg-[#0a0a0a] h-full md:h-screen md:sticky top-0 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src="/images/EZPAY-15.png"
              alt="EZPAY Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-black font-raleway text-white tracking-widest">EZ-PAY</h1>
            <p className="text-[9px] text-[#C9A227] uppercase tracking-[0.2em] font-semibold">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-premium">
        <p className="text-[9px] text-white/25 uppercase tracking-[0.2em] font-bold px-3 mb-3">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#9A2A2A]/15 text-[#f1d57c]"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-[#9A2A2A] rounded-r-full" />
                  )}
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#9A2A2A]/25 text-[#f1d57c]"
                      : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="leading-none">{item.label}</span>
                    <span className={`text-[9px] leading-none mt-0.5 transition-all ${
                      isActive ? "text-white/40" : "text-white/25 group-hover:text-white/40"
                    }`}>
                      {item.description}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all">
            <LogOut className="h-4 w-4" />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
}
