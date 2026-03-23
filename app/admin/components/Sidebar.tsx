import React from "react";
import Image from "next/image";
import {
  Home,
  Users,
  FileText,
  TrendingUp,
  UserCheck,
  Building2,
  LogOut,
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
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "listings",
      label: "Property",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: "applications",
      label: "Applications",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "landlords",
      label: "Landlords",
      icon: <UserCheck className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col w-full md:w-64 bg-white md:border-r h-full md:h-screen md:sticky top-0">
      <div className="p-6 border-b flex flex-col items-center">
        <div className="relative w-16 h-16 mb-2">
          <Image
            src="/images/EZPAY-15.png"
            alt="EZPAY Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-bold font-raleway text-primary">EZ-PAY</h1>
        <p className="text-xs text-gray-500">Admin Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
