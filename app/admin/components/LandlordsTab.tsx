"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Search,
  Filter,
  RefreshCw,
  Building,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

import { Landlord } from "@/app/types/property";

interface LandlordsTabProps {
  landlords: Landlord[];
  loading: boolean;
  fetchLandlords: () => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function LandlordsTab({
  landlords,
  loading,
  fetchLandlords,
  formatDate,
  getStatusBadge,
}: LandlordsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLandlords = landlords.filter((landlord) => {
    const matchesSearch =
      landlord.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || landlord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-raleway font-bold">Landlord Directory</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Review and manage property owners and corporate partners</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchLandlords}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, business, or email..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold">Landlord / Entity</TableHead>
                <TableHead className="font-bold">Contact & Business</TableHead>
                <TableHead className="font-bold">Onboarding Date</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-gray-500 mt-2">Loading landlords...</p>
                  </TableCell>
                </TableRow>
              ) : filteredLandlords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500 font-raleway">
                    No landlords found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLandlords.map((landlord) => (
                  <TableRow key={landlord.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                          {landlord.full_name?.charAt(0).toUpperCase() || <Building className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{landlord.full_name}</p>
                          <p className="text-xs text-gray-500">{landlord.occupation || landlord.designation || "Property Owner"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5" />
                          {landlord.email}
                        </div>
                        {landlord.business_name && (
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tight">
                            <Building className="h-3 w-3" />
                            {landlord.business_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {landlord.created_at ? formatDate(landlord.created_at) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(landlord.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
