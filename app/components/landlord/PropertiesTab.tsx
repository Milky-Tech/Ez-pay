"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Search,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  Key,
  FolderOpen,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { Badge } from "@/app/components/ui/badge";

interface PropertiesTabProps {
  properties: any[];
  drafts: any[];
  loading: boolean;
  onAddProperty: () => void;
  onViewDetails: (id: string, status: string) => void;
  onEditDraft: (id: string) => void;
}

const TABS = [
  { id: "available", label: "Available", shortLabel: "Live", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "rented", label: "Rented", shortLabel: "Rented", icon: Key, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "submitted", label: "Submitted", shortLabel: "Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "pending", label: "Upgrading", shortLabel: "Upgrade", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "drafts", label: "Drafts", shortLabel: "Drafts", icon: FolderOpen, color: "text-slate-600", bg: "bg-slate-100" },
];

export default function PropertiesTab({
  properties,
  drafts,
  loading,
  onAddProperty,
  onViewDetails,
  onEditDraft,
}: PropertiesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available");

  const match = (p: any) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      p.code_name?.toLowerCase().includes(q) ||
      p.area?.toLowerCase().includes(q) ||
      p.property_address?.toLowerCase().includes(q)
    );
  };

  const fp = properties.filter(match);
  const fd = drafts.filter(match);

  const counts = {
    available: fp.filter(p => p.status === "approved" && p.listing_status === "available").length,
    rented: fp.filter(p => p.status === "approved" && (p.listing_status === "rented" || p.listing_status === "occupied")).length,
    pending: fp.filter(p => p.listing_status === "pending_upgrade" || p.listing_status === "upgrade_pending").length,
    submitted: fp.filter(p => p.status !== "approved" && p.listing_status !== "pending_upgrade" && p.listing_status !== "upgrade_pending").length,
    drafts: fd.length,
  };

  const getItems = () => {
    switch (activeTab) {
      case "available":  return { items: fp.filter(p => p.status === "approved" && p.listing_status === "available"), isDraft: false };
      case "rented":     return { items: fp.filter(p => p.status === "approved" && (p.listing_status === "rented" || p.listing_status === "occupied")), isDraft: false };
      case "pending":    return { items: fp.filter(p => p.listing_status === "pending_upgrade" || p.listing_status === "upgrade_pending"), isDraft: false };
      case "submitted":  return { items: fp.filter(p => p.status !== "approved" && p.listing_status !== "pending_upgrade" && p.listing_status !== "upgrade_pending"), isDraft: false };
      case "drafts":     return { items: fd, isDraft: true };
      default:           return { items: [], isDraft: false };
    }
  };

  const { items, isDraft } = getItems();
  const tab = TABS.find(t => t.id === activeTab)!;
  const TabIcon = tab.icon;

  const EmptyState = () => (
    <Card className="border-dashed border-2 border-slate-200 py-12 text-center bg-transparent shadow-none">
      <CardContent className="space-y-4 flex flex-col items-center">
        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center">
          <TabIcon className="h-7 w-7 text-slate-300" />
        </div>
        <div>
          <p className="text-slate-600 font-semibold">Nothing here yet</p>
          <p className="text-slate-400 text-sm mt-1">
            {activeTab === "drafts" ? "Start a property listing to see it here." : "Properties in this state will appear here."}
          </p>
        </div>
        {(activeTab === "available" || activeTab === "drafts") && (
          <Button onClick={onAddProperty} className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white gap-2 rounded-xl shadow-md shadow-[#9A2A2A]/20">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-raleway">My Properties</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage your real estate portfolio</p>
        </div>
        <Button
          onClick={onAddProperty}
          className="bg-[#9A2A2A] hover:bg-[#7a2222] text-white shadow-md shadow-[#9A2A2A]/20 gap-1.5 rounded-xl text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Property</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search properties..."
          className="pl-10 h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-[#9A2A2A]/20 shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tab strip — horizontal scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {TABS.map((t) => {
          const TIcon = t.icon;
          const count = counts[t.id as keyof typeof counts];
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? `bg-[#9A2A2A] text-white border-[#9A2A2A] shadow-md shadow-[#9A2A2A]/20`
                  : `bg-white text-slate-600 border-slate-200 hover:border-slate-300`
              }`}
            >
              <TIcon className={`h-3.5 w-3.5 ${isActive ? "text-white" : t.color}`} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.shortLabel}</span>
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? "bg-white/20 text-white" : `${t.bg} ${t.color}`}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading properties...</span>
        </div>
      )}

      {/* Property list */}
      {!loading && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isDraft={isDraft}
                onViewDetails={() => {
                  if (isDraft) {
                    localStorage.setItem(`draft_${p.id}`, JSON.stringify(p));
                    onEditDraft(p.id);
                  } else {
                    onViewDetails(p.id, p.status);
                  }
                }}
                onEditDraft={() => {
                  localStorage.setItem(`draft_${p.id}`, JSON.stringify(p));
                  onEditDraft(p.id);
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
