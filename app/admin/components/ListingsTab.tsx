import React, { useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
   Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Link from "next/link";
import PropertyReviewDialog from "./PropertyReviewDialog";

interface Property {
  id: string;
  code_name: string;
  typology: string;
  email: string;
  phone: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  listing_status: string;
  status?: string; // For pending properties
  full_name: string;
  rent: number;
  created_at: string;
  landlord_package: string;
  [key: string]: any;
}

interface ListingsTabProps {
  listings: Property[]; // Contains ALL properties (pending + approved)
  loading: boolean;
  fetchListings: () => void;
  formatPrice: (price: number | null) => string;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  onApprove: (
    property: Property,
    inspectionFee: number,
    monthlyRentAscend: number,
    monthlyRentAnchor: number,
    upgradeLoan?: number,
    amortizationPeriod?: number
  ) => Promise<void>;
  onReject: (property: Property, comment?: string) => Promise<void>;
  onUpdateAvailability: (id: string, status: string) => Promise<void>;
  onDelete: (id: string, name: string) => void;
}

export default function ListingsTab({
  listings,
  loading,
  fetchListings,
  formatPrice,
  formatDate,
  getStatusBadge,
  onApprove,
  onReject,
  onUpdateAvailability,
  onDelete,
}: ListingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("approved");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter Logic

  // Filter Logic
  const filteredListings = listings.filter((listing) => {
    // Basic Search
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      listing.code_name?.toLowerCase().includes(searchString) ||
      listing.full_name?.toLowerCase().includes(searchString) ||
      listing.area?.toLowerCase().includes(searchString) ||
      listing.id.toString().includes(searchString);

    // Status Filter (Dropdown)
    const matchesStatusFilter =
      statusFilter === "all" ||
      (activeSubTab === "approved"
        ? listing.listing_status === statusFilter
        : listing.status === statusFilter);

    // Tab Filter (Pending vs Approved vs Upgrading)
    const isUpgradePending = listing.status === "approved" && listing.listing_status === "upgrade_pending";
    const isApproved =
      listing.status === "approved" && !isUpgradePending;

    if (activeSubTab === "approved") {
      return matchesSearch && matchesStatusFilter && isApproved;
    } else if (activeSubTab === "upgrading") {
      return matchesSearch && matchesStatusFilter && isUpgradePending;
    } else {
      return matchesSearch && matchesStatusFilter && !isApproved && !isUpgradePending;
    }
  });

  // Logic handled in PropertyReviewDialog

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs
            value={activeSubTab}
            onValueChange={setActiveSubTab}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="pending">Submission Requests</TabsTrigger>
              <TabsTrigger value="approved">Manage Properties</TabsTrigger>
              <TabsTrigger value="upgrading">Pending Upgrades</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={fetchListings}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {/* Filters */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search listings..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {activeSubTab === "approved" ? (
                <>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </>
              ) : activeSubTab === "upgrading" ? (
                <SelectItem value="upgrade_pending">Upgrade Pending</SelectItem>
              ) : (
                <>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-4">Loading data...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No listings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID/Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    {activeSubTab === "approved" ? "Monthly Rent" : "Owner"}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {activeSubTab === "approved" ? (
                        item.code_name
                      ) : (
                        <span className="text-xs">
                          Pending #{item.id.toString().substring(0, 6)}
                        </span>
                      )}
                      <div className="text-[10px] text-gray-500">
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.typology}</Badge>
                      {item.landlord_package && (
                        <div className="text-[10px] uppercase font-bold text-primary mt-1">
                          {item.landlord_package === "prime"
                            ? "EZ-PRIME"
                            : "EZ-VANTAGE"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm">
                        {item.area}, {item.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeSubTab === "approved" ? (
                        <span className="fontWeight-semibold">
                          {formatPrice(item.monthly_cost)}
                        </span>
                      ) : (
                        <div className="text-sm">
                          <p>{item.full_name}</p>
                          <p className="text-xs text-gray-500">{item.phone}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        activeSubTab === "approved"
                          ? item.listing_status
                          : item.status || "pending"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {activeSubTab === "pending" ? (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Review"
                                >
                                  <Eye className="h-4 w-4 mr-1" /> Reivew
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <PropertyReviewDialog
                                    property={item}
                                    onApprove={onApprove}
                                    onReject={onReject}
                                    refreshData={fetchListings}
                                  />
                                </DialogContent>
                              </Dialog>
                          </>
                        ) : (
                          <>
                            {item.listing_status === "upgrade_pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                onClick={() => onUpdateAvailability(item.id, "available")}
                              >
                                Mark Available
                              </Button>
                            )}
                            {item.listing_status === "available" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                                onClick={() => onUpdateAvailability(item.id, "maintenance")}
                              >
                                Maintenance
                              </Button>
                            )}
                            <Link
                              href={`/listings/${item.code_name || item.id}`}
                              target="_blank"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                title="View Publicly"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => onDelete(item.id, item.code_name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

    </Card>
  );
}
