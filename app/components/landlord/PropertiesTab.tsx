"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Search,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  Layout,
  Key,
  FolderOpen,
} from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { useRouter } from "next/navigation";

interface PropertiesTabProps {
  properties: any[];
  drafts: any[];
  loading: boolean;
  onAddProperty: () => void;
  onViewDetails: (id: string) => void;
  onEditDraft: (id: string) => void;
}

export default function PropertiesTab({
  properties,
  drafts,
  loading,
  onAddProperty,
  onViewDetails,
  onEditDraft,
}: PropertiesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredProperties = properties.filter(
    (p) =>
      p.code_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.property_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrafts = drafts.filter(
    (p) =>
      p.code_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.property_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    available: filteredProperties.filter((p) => p.availability_status === "available" && p.status === "approved").length,
    rented: filteredProperties.filter((p) => p.availability_status === "rented" || p.availability_status === "occupied").length,
    submitted: filteredProperties.filter((p) => p.status === "pending").length,
    drafts: filteredDrafts.length,
  };

  const PropertyList = ({ items, emptyMessage, icon: Icon, isDraft = false }: { items: any[], emptyMessage: string, icon: any, isDraft?: boolean }) => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card className="border-dashed border-2 py-12 text-center bg-transparent">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">{emptyMessage}</p>
            <Button variant="outline" onClick={onAddProperty} className="gap-2">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        items.map((p) => (
          <PropertyCard 
            key={p.id} 
            property={p} 
            onViewDetails={() => {
              if (isDraft) {
                // Store draft data to prevent re-fetching on the edit page
                localStorage.setItem(`draft_${p.id}`, JSON.stringify(p));
                onEditDraft(p.id);
              } else {
                onViewDetails(p.id);
              }
            }} 
          />
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-raleway">My Properties</h2>
          <p className="text-slate-500 text-sm">Review and manage your real estate portfolio.</p>
        </div>
        <Button onClick={onAddProperty} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
          <Plus className="h-4 w-4" /> Add New Property
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by code name, area, or address..."
          className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-primary/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="available" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Live/Available</span>
            <span className="sm:hidden">Available</span>
            <div className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{stats.available}</div>
          </TabsTrigger>
          <TabsTrigger value="rented" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Key className="h-4 w-4" />
            <span>Rented</span>
            <div className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{stats.rented}</div>
          </TabsTrigger>
          <TabsTrigger value="submitted" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Clock className="h-4 w-4" />
            <span>Submitted</span>
            <div className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{stats.submitted}</div>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <FolderOpen className="h-4 w-4" />
            <span>Drafts</span>
            <div className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{stats.drafts}</div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-0">
          <PropertyList 
            items={filteredProperties.filter(p => p.availability_status === "available" && p.status === "approved")}
            emptyMessage="No available properties currently listed."
            icon={Building}
          />
        </TabsContent>
        <TabsContent value="rented" className="mt-0">
          <PropertyList 
            items={filteredProperties.filter(p => p.availability_status === "rented" || p.availability_status === "occupied")}
            emptyMessage="No rented properties found."
            icon={Key}
          />
        </TabsContent>
        <TabsContent value="submitted" className="mt-0">
          <PropertyList 
            items={filteredProperties.filter(p => p.status === "pending")}
            emptyMessage="No current submission requests."
            icon={Clock}
          />
        </TabsContent>
        <TabsContent value="drafts" className="mt-0">
          <PropertyList 
            items={filteredDrafts}
            emptyMessage="You have no property drafts."
            icon={FolderOpen}
            isDraft={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
