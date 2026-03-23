"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/context/authcontext";
import { useToast } from "@/hooks/use-toast";

// New Components
import Sidebar from "./components/Sidebar";
import AdminHeader from "./components/AdminHeader";
import OverviewTab from "./components/OverviewTab";
import ListingsTab from "./components/ListingsTab";
import ApplicationsTab from "./components/ApplicationsTab";
import UsersTab from "./components/UsersTab";
import LandlordsTab from "./components/LandlordsTab";
import {
  Sheet,
  SheetContent,
} from "@/app/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Interface definitions
export interface Property {
  id: string;
  code_name: string;
  typology: string;
  email: string;
  phone: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  listing_status: string;
  status?: string;
  role?: string;
  full_name: string;
  property_address: string;
  no_of_units: number;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  desired_annual_rent: number;
  compound_road?: string;
  interior_rooms?: string;
  exterior_shot?: string;
  landlord_package: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Application {
  id: string;
  unique_id: string;
  status: string;
  tenant_package: string;
  listing_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  current_address: string;
  current_landlord_name: string;
  current_landlord_contact: string;
  reason_for_leaving: string;
  duration_of_stay: string;
  company_name: string;
  job_title: string;
  monthly_income: number;
  hr_contact: string;
  desired_start_date: string;
  payment_plan: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  bank_statement_path: string;
  government_id_path: string;
  live_photo_path: string;
  verification_video_path: string;
  created_at: string;
  updated_at: string;
  properties?: Property;
}

export interface Landlord {
  id: string;
  full_name: string;
  fullName?: string; // For backward compatibility
  email: string;
  phone: string;
  password?: string;
  password_confirmation?: string;
  designation?: string;
  occupation?: string;
  nationality?: string;
  state_of_origin?: string;
  lga_of_origin?: string;
  residential_address?: string;
  place_of_work?: string;
  business_name?: string;
  business_address?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  status: string;
  role?: string;
  created_at: string;
}

// Helper function for price formatting
const formatPrice = (price: number | null) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<{
    listings: Property[];
    pendingListings: Property[];
    applications: Application[];
    users: Landlord[];
    landlords: Landlord[];
  }>({
    listings: [],
    pendingListings: [],
    applications: [],
    users: [],
    landlords: [],
  });

  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalLandlords: 0,
    activeLandlords: 0,
  });

  const [loading, setLoading] = useState({
    listings: false,
    applications: false,
    users: false,
    landlords: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { user, isAuthenticated, logout, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Dialog states for deletion
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "listing" | "user" | null;
    id: string | null;
    name: string | null;
  }>({
    open: false,
    type: null,
    id: null,
    name: null,
  });

  // Centralized stats calculation
  useEffect(() => {
    setStats({
      totalProperties: data.listings.length + data.pendingListings.length,
      availableProperties: data.listings.filter(
        (l: Property) => l.listing_status === "available"
      ).length,
      totalApplications: data.applications.length,
      pendingApplications: data.applications.filter(
        (app: Application) => ["pending", "submitted", "vetting_pending"].includes(app.status)
      ).length,
      totalLandlords: data.landlords.length,
      activeLandlords: data.landlords.filter((l: Landlord) => l.status === "active").length,
    });
  }, [data]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        properties: true,
        applications: true,
        listings: true,
        users: true,
        landlords: true,
      }));
      await Promise.all([
        fetchApplications(),
        fetchListings(),
        fetchPendingListings(),
        fetchUsers(),
        fetchLandlords(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading((prev) => ({
        ...prev,
        properties: false,
        applications: false,
        listings: false,
        users: false,
        landlords: false,
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Fetch Listings (Active)
  const fetchListings = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, listings: true }));
      const response = await fetch(`${API_BASE_URL}/listings`, {
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (!response.ok) throw new Error("Failed to fetch listings");
      const result = await response.json();
      const listingsData = result.data || result;
      setData((prev) => ({ ...prev, listings: listingsData }));
      setData((prev) => ({ ...prev, listings: listingsData }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, listings: false }));
    }
  }, [token]);

  // Fetch Applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, applications: true }));
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (response.ok) {
        const result = await response.json();
        const apps = result.data || result;
        setData((prev) => ({ ...prev, applications: apps }));
        setData((prev) => ({ ...prev, applications: apps }));
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, applications: false }));
    }
  }, [token]);

  // Fetch Pending Listings
  const fetchPendingListings = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, listings: true }));
      const response = await fetch(`${API_BASE_URL}/listings/pending`, {
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pending listings");
      const result = await response.json();
      setData((prev) => ({ ...prev, pendingListings: result.data || result }));
      console.log(pendingListings)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, listings: false }));
    }
  }, [token, API_BASE_URL]);

  // Application Actions
  const handleApproveApplication = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      toast({ title: "Approved", description: "Application approved." });
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve application.",
      });
    }
  };

  const handleRejectApplication = async (id: string, comment?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id, comment }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      toast({ title: "Rejected", description: "Application rejected." });
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject application.",
      });
    }
  };

  // Fetch Users & Landlords
  const fetchUsers = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      setData((prev) => ({ ...prev, users: result.data || result }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, [token]);

  const fetchLandlords = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, landlords: true }));
      const response = await fetch(`${API_BASE_URL}/landlords`, {
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (response.ok) {
        const result = await response.json();
        const allLandlords = result.data || result;
        setData((prev) => ({ ...prev, landlords: allLandlords }));
        setData((prev) => ({ ...prev, landlords: allLandlords }));
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, landlords: false }));
    }
  }, [token]);

  // User Actions
  const handleRegisterAdmin = async (adminData: any) => {
    try {
      // We use a direct fetch instead of the context register to avoid logging out the current admin
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...adminData,
          role: "admin", // Passing role to API
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to register admin");
      }

      toast({ title: "Admin Created", description: "New administrator registered successfully." });
      fetchUsers();
      return true;
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.message || "Failed to register admin.",
      });
      return false;
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    setDeleteDialog({
      open: true,
      type: "user",
      id,
      name,
    });
  };

  const confirmDeleteUser = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${deleteDialog.id}`, {
        method: "DELETE",
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (!response.ok) throw new Error("Failed to delete user");
      toast({ title: "User Deleted", description: "User removed successfully." });
      fetchUsers();
      setDeleteDialog({ open: false, type: null, id: null, name: null });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      });
    }
  };

  // Consolidated Handlers passed to components
  const handleDeleteListing = async (id: string, name: string) => {
    setDeleteDialog({
      open: true,
      type: "listing",
      id,
      name,
    });
  };

  const confirmDeleteListing = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/listings/${deleteDialog.id}`, {
        method: "DELETE",
        headers: { 
          "Accept": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}` 
        },
      });
      if (!response.ok) throw new Error("Failed to delete listing");
      toast({ title: "Deleted", description: "Listing deleted successfully." });
      setDeleteDialog({ open: false, type: null, id: null, name: null });
      fetchListings(); // refresh listings
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete listing.",
      });
    }
  };

  const handleApproveListing = async (
    property: Property,
    inspectionFee: number,
    monthlyRentAscend: number,
    monthlyRentAnchor: number,
    upgradeLoan?: number,
    amortizationPeriod?: number
  ) => {
    try {
      // Logic for status based on package
      // EZPRIME: status = "approved", availability_status = "available"
      // EZVANTAGE: status = "approved", availability_status = "upgrade_pending"
      const isPrime = property.landlord_package === "prime";
      const listingStatus = isPrime ? "available" : "upgrade_pending";

      const response = await fetch(`${API_BASE_URL}/listings/${property.id}`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          inspection_fee: inspectionFee,
          monthly_rent_ascend: monthlyRentAscend,
          monthly_rent_anchor: monthlyRentAnchor,
          upgrade_loan: upgradeLoan,
          amortization_period: amortizationPeriod,
          status: "approved",
          listing_status: listingStatus,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to approve property");
      }

      toast({
        title: "Approved",
        description: `Listing approved as ${isPrime ? "Prime" : "Vantage"}. Initial status: ${listingStatus}`,
      });
      fetchDashboardData();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Could not approve listing.",
      });
      throw error; // Propagate to component
    }
  };

  const handleRejectListing = async (property: Property, comment?: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/listings/${property.id}`,
        {
          method: "PATCH",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "rejected", comment, is_draft: "true" }),
        }
      );
      if (!response.ok) throw new Error("Failed to reject property");
      toast({ title: "Rejected", description: "Listing submission rejected." });
      fetchListings();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject listing.",
      });
      throw error;
    }
  };

  const handleUpdateAvailability = async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/listings/${id}/availability`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          availability_status: status,
          listing_status: status 
        }),
      });
      if (!response.ok) throw new Error("Failed to update availability");
      toast({ title: "Updated", description: `Property marked as ${status}.` });
      fetchListings();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update availability.",
      });
    }
  };

  // Initial Load
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      router.push("/signin");
    }
  }, [isAuthenticated, router, fetchDashboardData]);

  if (!isAuthenticated) return null;

  // Helper for status badges (reused)
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      rented: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      submitted: "bg-yellow-100 text-yellow-800",
      vetting_pending: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      in_review: "bg-blue-50 text-blue-600",
      rejected: "bg-red-100 text-red-800",
      upgrade_pending: "bg-amber-100 text-amber-800",
    };
    const colorClass = variants[status] || "bg-gray-100 text-gray-800";
    return (
      <Badge variant="outline" className={`border-none ${colorClass}`}>
        {status}
      </Badge>
    );
  };

  // Listings for ListingsTab
  // Combined Approved and Pending listings
  const combinedListings = [...data.listings, ...data.pendingListings];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={logout}
        />
      </div>

      {/* Sidebar - Mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={logout}
            onClose={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title={activeTab}
          userName={user?.full_name || "Admin"}
          onMenuClick={() => setMobileMenuOpen(true)}
          onRefresh={fetchDashboardData}
          isRefreshing={Object.values(loading).some((v) => v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" && (
            <OverviewTab
              stats={stats}
              properties={data.listings} // Show approved listings in Overview as per requirement
              applications={data.applications}
              loading={loading}
              getStatusBadge={getStatusBadge}
              formatPrice={formatPrice}
              formatDate={formatDate}
              fetchProperties={fetchListings} // Refresh listings instead
              fetchApplications={fetchApplications}
            />
          )}

          {activeTab === "listings" && (
            <ListingsTab
              listings={combinedListings}
              loading={loading.listings}
              fetchListings={() => {
                fetchListings();
                fetchPendingListings();
              }}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              onApprove={handleApproveListing}
              onReject={handleRejectListing}
              onUpdateAvailability={handleUpdateAvailability}
              onDelete={(id, name) => handleDeleteListing(id, name)}
            />
          )}

          {activeTab === "applications" && (
            <ApplicationsTab
              applications={data.applications}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              fetchApplications={fetchApplications}
              approveApplication={handleApproveApplication}
              rejectApplication={handleRejectApplication}
            />
          )}

          {/* Users & Landlords - keeping simplified placeholders or existing logic if I had the full components */}
          {/* Note: In a real scenario I would reuse the table logic for Users/Landlords here similar to above tabs */}
          {activeTab === "users" && (
            <UsersTab
              users={data.users}
              loading={loading.users}
              fetchUsers={fetchUsers}
              formatDate={formatDate}
              onRegisterAdmin={handleRegisterAdmin}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === "landlords" && (
            <LandlordsTab
              landlords={data.landlords}
              loading={loading.landlords}
              fetchLandlords={fetchLandlords}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />
          )}
        </main>
      </div>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteDialog.type === "listing" ? "listing" : "user"}{" "}
              <span className="font-semibold text-gray-900">"{deleteDialog.name}"</span>{" "}
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.type === "listing" ? confirmDeleteListing : confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
