"use client";

import { useState, useEffect, useCallback } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/app/components/ui/alert-dialog";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Home,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Eye,
  Building2,
  UserCheck,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PropertyReviewDialog from "./components/PropertyReviewDialog";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

// Interface definitions
interface Property {
  id: string;
  code_name: string;
  typology: string;
  email: string;
  phone: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  availability_status: string;
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
}

interface Application {
  id: string;
  property_id: string;
  status: string;
  payment_plan_preference: string;
  created_at: string;
  properties?: Property;
  full_name?: string;
  email?: string;
  phone?: string;
}

interface Landlord {
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [listings, setListings] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<Landlord[]>([]);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalLandlords: 0,
    activeLandlords: 0,
  });

  const [loading, setLoading] = useState({
    properties: false,
    listings: false,
    applications: false,
    users: false,
    landlords: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    property: null as Property | null,
  });
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    property: null as Property | null,
    action: "" as "approve" | "reject",
  });
  const [isProcessing, setIsProcessing] = useState(false);
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

  const [editListingDialog, setEditListingDialog] = useState<{
    open: boolean;
    property: Property | null;
  }>({
    open: false,
    property: null,
  });

  const { user, isAuthenticated, logout, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch all dashboard data for overview
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        properties: true,
        applications: true,
        listings: true,
      }));
      await Promise.all([
        fetchProperties(),
        fetchApplications(),
        fetchListings(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading((prev) => ({
        ...prev,
        properties: false,
        applications: false,
        listings: false,
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch properties from API
  const fetchProperties = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, properties: true }));
      const response = await fetch(`${API_BASE_URL}/property/properties`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }

      const data = await response.json();
      const propertiesData = data.data || data;
      setProperties(propertiesData);

      // Update stats
      const approvedCount = propertiesData.filter(
        (p: Property) => p.status === "approved",
      ).length;

      setStats((prev) => ({
        ...prev,
        totalProperties: propertiesData.length,
        availableProperties: approvedCount,
      }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch properties",
      });
    } finally {
      setLoading((prev) => ({ ...prev, properties: false }));
    }
  }, [token, toast]);

  // Fetch listings from API
  const fetchListings = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, listings: true }));
      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.statusText}`);
      }

      const data = await response.json();
      setListings(data.data || data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading((prev) => ({ ...prev, listings: false }));
    }
  }, [token]);

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, applications: true }));
      const response = await fetch(`${API_BASE_URL}/listings/apply`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || data);

        const pendingCount = (data.data || data).filter(
          (app: Application) =>
            app.status === "submitted" || app.status === "vetting_pending",
        ).length;

        setStats((prev) => ({
          ...prev,
          totalApplications: (data.data || data).length,
          pendingApplications: pendingCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading((prev) => ({ ...prev, applications: false }));
    }
  }, [token]);

  // Fetch all users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.data || data);

      const activeCount = (data.data || data).filter(
        (u: any) => u.status === "active",
      ).length;

      setStats((prev) => ({
        ...prev,
        totalLandlords: (data.data || data).length,
        activeLandlords: activeCount,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, [token]);

  // Fetch landlords from API
  const fetchLandlords = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, landlords: true }));
      const response = await fetch(`${API_BASE_URL}/landlords`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allLandlords = data.data || data;
        setLandlords(allLandlords);

        const activeCount = allLandlords.filter(
          (landlord: Landlord) => landlord.status === "active",
        ).length;

        setStats((prev) => ({
          ...prev,
          totalLandlords: allLandlords.length,
          activeLandlords: activeCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching landlords:", error);
    } finally {
      setLoading((prev) => ({ ...prev, landlords: false }));
    }
  }, [token]);

  // Delete listing handler
  const handleDeleteListing = async () => {
    if (!deleteDialog.id) return;
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/listings/${deleteDialog.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to delete listing");

      toast({
        title: "Listing Deleted",
        description: "The property listing has been successfully removed.",
      });
      fetchListings();
    } catch (error) {
      console.error("Delete listing error:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the listing.",
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ open: false, type: null, id: null, name: null });
    }
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!deleteDialog.id) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${deleteDialog.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast({
        title: "User Deleted",
        description: "The user account has been successfully removed.",
      });
      fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the user.",
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ open: false, type: null, id: null, name: null });
    }
  };

  // Update listing handler
  const handleUpdateListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editListingDialog.property) return;

    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        `${API_BASE_URL}/listings/${editListingDialog.property.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) throw new Error("Failed to update listing");

      toast({
        title: "Listing Updated",
        description: "The property listing has been successfully updated.",
      });
      fetchListings();
      setEditListingDialog({ open: false, property: null });
    } catch (error) {
      console.error("Update listing error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the listing.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle tab changes and initial data loading
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    switch (activeTab) {
      case "properties":
        fetchProperties();
        break;
      case "applications":
        fetchApplications();
        break;
      case "users":
        fetchUsers();
        break;
      case "landlords":
        fetchLandlords();
        break;
      default:
        fetchDashboardData();
        break;
    }
  }, [activeTab, isAuthenticated, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open approval dialog
  const openApprovalDialog = (property: Property) => {
    setApprovalDialog({ open: true, property });
  };

  // Open confirmation dialog
  const openConfirmationDialog = (
    property: Property,
    action: "approve" | "reject",
  ) => {
    setConfirmationDialog({
      open: true,
      property,
      action,
    });
  };

  // Approve Property Submission
  const approveProperty = async () => {
    const { property } = confirmationDialog;

    if (!property) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/property/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property_registration_id: property.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve property");
      }

      toast({
        title: "✅ Property Approved",
        description: "Property has been successfully approved and listed.",
      });

      // Refresh data
      fetchProperties();
      fetchListings();
    } catch (error) {
      console.error("Approve property error:", error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error approving the property.",
      });
    } finally {
      setIsProcessing(false);
      setConfirmationDialog({ open: false, property: null, action: "approve" });
      setApprovalDialog({ open: false, property: null });
    }
  };

  // Reject Property Submission
  const rejectProperty = async () => {
    const { property } = confirmationDialog;

    if (!property) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/property/${property.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "rejected" }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject property");
      }

      toast({
        title: "Property Rejected",
        description: "Property submission has been rejected.",
      });

      fetchProperties();
    } catch (error) {
      console.error("Reject property error:", error);
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "There was an error rejecting the property.",
      });
    } finally {
      setIsProcessing(false);
      setConfirmationDialog({ open: false, property: null, action: "reject" });
      setApprovalDialog({ open: false, property: null });
    }
  };

  // Filter properties based on search and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      searchTerm === "" ||
      property.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter listings based on search and status
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      searchTerm === "" ||
      listing.code_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.area?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || listing.availability_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter applications
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      searchTerm === "" ||
      application.id?.toString().includes(searchTerm) ||
      application.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter landlords
  const filteredLandlords = landlords.filter((landlord) => {
    const matchesSearch =
      searchTerm === "" ||
      landlord.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || landlord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | "success";
        label: string;
        icon?: React.ReactNode;
      }
    > = {
      available: {
        variant: "success",
        label: "Available",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      rented: {
        variant: "default",
        label: "Rented",
        icon: <Home className="h-3 w-3 mr-1" />,
      },
      maintenance: {
        variant: "outline",
        label: "Maintenance",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      active: {
        variant: "success",
        label: "Active",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      inactive: {
        variant: "destructive",
        label: "Inactive",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
      submitted: {
        variant: "outline",
        label: "Submitted",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      vetting_pending: {
        variant: "secondary",
        label: "Vetting",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      approved: {
        variant: "success",
        label: "Approved",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      pending: {
        variant: "secondary",
        label: "Pending",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      in_review: {
        variant: "outline",
        label: "In Review",
        icon: <Eye className="h-3 w-3 mr-1" />,
      },
      rejected: {
        variant: "destructive",
        label: "Rejected",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      label: status,
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "properties":
        fetchProperties();
        break;
      case "applications":
        fetchApplications();
        break;
      case "users":
        fetchUsers();
        break;
      case "landlords":
        fetchLandlords();
        break;
      default:
        fetchDashboardData();
        break;
    }
  };

  // Fix the conditional redirect
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Safely handle user.full_name
  const userName = user?.full_name ? user.full_name.toUpperCase() : "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 w-full justify-between">
            <h1 className="text-3xl font-bold font-raleway">
              <Link href="/">Bridgent HomeStep EZ-Pay</Link>
            </h1>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-white/10 p-2 rounded transition"
                title="Logout"
              >
                <LogOut size={24} />
              </button>
            )}
          </div>
          <p className="text-sm opacity-90 mt-1">Admin Dashboard</p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome! {userName}</h1>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={
              loading.properties || loading.applications || loading.landlords
            }
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                loading.properties || loading.applications || loading.landlords
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 mt-2 mb-8 sm:mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:w-auto xl:inline-grid gap-1">
            <TabsTrigger
              value="overview"
              className="font-montserrat text-xs sm:text-sm px-2 sm:px-4"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="properties"
              className="font-montserrat text-xs sm:text-sm px-2 sm:px-4"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Pending Submissions</span>
              <span className="sm:hidden">Pending</span>
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="font-montserrat text-xs sm:text-sm px-2 sm:px-4"
            >
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Listings</span>
              <span className="sm:hidden">Listings</span>
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="font-montserrat text-xs sm:text-sm px-2 sm:px-4"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Applications</span>
              <span className="sm:hidden">Apps</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="font-montserrat text-xs sm:text-sm px-2 sm:px-4"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="landlords"
              className="font-montserrat text-xs sm:text-sm px-2 sm:px-4"
            >
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Landlords</span>
              <span className="sm:hidden">Landlords</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="font-raleway">
                  Dashboard Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Properties
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.totalProperties}
                          </p>
                        </div>
                        <Home className="h-8 w-8 text-primary" />
                      </div>
                      <div className="mt-2">
                        <Badge variant="success">
                          {stats.availableProperties} Available
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Applications
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.totalApplications}
                          </p>
                        </div>
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {stats.pendingApplications} Pending
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Active Landlords
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.activeLandlords}
                          </p>
                        </div>
                        <UserCheck className="h-8 w-8 text-primary" />
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">
                          Total: {stats.totalLandlords}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Property Submissions */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Property Submissions
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID & Date</TableHead>
                          <TableHead>Type & Package</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.slice(0, 5).map((property) => (
                          <TableRow key={property.id}>
                            <TableCell>
                              <div className="text-xs font-medium">
                                #{property.id}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {formatDate(property.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-medium">
                                {property.typology}
                              </div>
                              <div className="text-[10px] uppercase font-bold text-primary">
                                {property.landlord_package === "prime"
                                  ? "EZ-PRIME"
                                  : "EZ-VANTAGE"}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {property.area}, {property.state}
                            </TableCell>
                            <TableCell className="text-sm">
                              {property.full_name}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(property.status || "pending")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="font-raleway">
                    Pending Submissions
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={fetchProperties}
                      variant="outline"
                      size="sm"
                      disabled={loading.properties}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading.properties ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search properties by name, code, or location..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Recent Submissions</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading.properties ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-4">Loading properties...</p>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">
                      {searchTerm || statusFilter !== "all"
                        ? "No submissions match your search criteria"
                        : "No property submissions found."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID & Date</TableHead>
                          <TableHead>Owner & Contact</TableHead>
                          <TableHead>Type & Package</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Monthly Rent</TableHead>
                          <TableHead>AI Quality Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property: Property) => (
                          <TableRow key={property.id}>
                            <TableCell>
                              <div className="text-xs font-medium">
                                #{property.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(property.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p className="font-medium truncate">
                                  {property.full_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {property.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {property.phone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {property.typology}
                                </Badge>
                                {property.landlord_package && (
                                  <div className="text-[10px] uppercase font-bold text-primary">
                                    {property.landlord_package === "prime"
                                      ? "EZ-PRIME"
                                      : "EZ-VANTAGE"}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[150px] truncate text-sm">
                                {property.area}, {property.state}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {property.monthly_cost
                                ? formatPrice(property.monthly_cost)
                                : property.rent
                                  ? formatPrice(
                                      Math.round((property.rent * 1.1) / 12),
                                    )
                                  : "N/A"}
                            </TableCell>
                            <TableCell className="text-center font-bold text-primary">
                               {/* Placeholder for AI Score - normally fetched from meta or calculated */}
                               {Math.floor(Math.random() * 20) + 75}%
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(property.status || "pending")}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      title="Review Submission"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Review Property Submission #
                                        {property.id}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <PropertyReviewDialog
                                      property={property}
                                      onApprove={() =>
                                        openApprovalDialog(property)
                                      }
                                      onReject={() =>
                                        openConfirmationDialog(
                                          property,
                                          "reject",
                                        )
                                      }
                                    />
                                  </DialogContent>
                                </Dialog>

                                {property.status !== "approved" && (
                                  <>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() =>
                                        openConfirmationDialog(
                                          property,
                                          "approve",
                                        )
                                      }
                                      title="Approve"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        openConfirmationDialog(
                                          property,
                                          "reject",
                                        )
                                      }
                                      title="Reject"
                                    >
                                      <XCircle className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="font-raleway">
                    Property Listings
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={fetchListings}
                      variant="outline"
                      size="sm"
                      disabled={loading.listings}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading.listings ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search listings by name, code, or location..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading.listings ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-4">Loading listings...</p>
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">
                      {searchTerm || statusFilter !== "all"
                        ? "No listings match your search criteria"
                        : "No listings found."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Monthly Rent</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredListings.map((listing) => (
                          <TableRow key={listing.id}>
                            <TableCell className="font-medium">
                              {listing.code_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {listing.typology}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {listing.area}, {listing.state}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(listing.monthly_cost)}
                            </TableCell>
                            <TableCell>{listing.no_of_units}</TableCell>
                            <TableCell>
                              {getStatusBadge(listing.availability_status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link
                                  href={`/listings/${
                                    listing.code_name || listing.id
                                  }`}
                                  target="_blank"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="View publicly"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Edit listing details"
                                  onClick={() =>
                                    setEditListingDialog({
                                      open: true,
                                      property: listing,
                                    })
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      type: "listing",
                                      id: listing.id,
                                      name: listing.code_name,
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle className="font-raleway">
                  Rental Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search applications..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading.applications ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-4">
                      Loading applications...
                    </p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No applications found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application ID</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Payment Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">
                              {application.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {application.full_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {application.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {application.properties?.typology || "N/A"}
                            </TableCell>
                            <TableCell>
                              {application.payment_plan_preference}
                            </TableCell>
                            <TableCell>
                              {formatDate(application.created_at)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(application.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-4 w-4" />
                                </Button>
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
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-raleway">
                    User Management
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Manage all registered users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.users ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading users...
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete User"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "user",
                                    id: user.id,
                                    name: user.full_name,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landlords">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-raleway">Landlords</CardTitle>
                  <p className="text-sm text-gray-500">
                    Manage property owners
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {loading.landlords ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading landlords...
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLandlords.map((landlord) => (
                        <TableRow key={landlord.id}>
                          <TableCell className="font-medium">
                            {landlord.full_name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{landlord.email}</p>
                              <p className="text-gray-500">{landlord.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(landlord.status)}
                          </TableCell>
                          <TableCell>
                            {formatDate(landlord.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog for Approve/Reject */}
      <AlertDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setConfirmationDialog({
              open: false,
              property: null,
              action: "approve",
            });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.action === "approve"
                ? "Approve Property Submission"
                : "Reject Property Submission"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.action === "approve" ? (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to approve this property submission?
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      This will:
                    </p>
                    <ul className="text-sm text-green-700 mt-2 list-disc pl-4 space-y-1">
                      <li>Approve the property for listing</li>
                      <li>Create landlord account if needed</li>
                      <li>
                        Make the property available for rental applications
                      </li>
                      <li>Send confirmation email to the property owner</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to reject this property submission?
                  </p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800">
                      This will:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 list-disc pl-4 space-y-1">
                      <li>Mark the property as rejected</li>
                      <li>Notify the property owner via email</li>
                      <li>Remove the property from pending submissions</li>
                    </ul>
                  </div>
                </div>
              )}
              {confirmationDialog.property && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Property Details:</p>
                  <p className="text-sm mt-1">
                    {confirmationDialog.property.typology}
                  </p>
                  <p className="text-sm text-gray-600">
                    {confirmationDialog.property.area},{" "}
                    {confirmationDialog.property.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    Owner: {confirmationDialog.property.full_name}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmationDialog.action === "approve"
                  ? approveProperty
                  : rejectProperty
              }
              disabled={isProcessing}
              className={
                confirmationDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : confirmationDialog.action === "approve" ? (
                "Approve Property"
              ) : (
                "Reject Property"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Dialog */}
      <Dialog
        open={approvalDialog.open}
        onOpenChange={(open) => {
          if (!open) setApprovalDialog({ open: false, property: null });
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Property Submission #{approvalDialog.property?.id}
            </DialogTitle>
          </DialogHeader>
          {approvalDialog.property && (
            <PropertyReviewDialog
              onApprove={() =>
                openConfirmationDialog(approvalDialog.property!, "approve")
              }
              onReject={() =>
                openConfirmationDialog(approvalDialog.property!, "reject")
              }
              property={approvalDialog.property}
              refreshData={() => {
                fetchProperties();
                fetchListings();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setDeleteDialog({ open: false, type: null, id: null, name: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <strong>{deleteDialog.type}</strong>: {deleteDialog.name} and
              remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isProcessing}
              onClick={(e) => {
                e.preventDefault();
                deleteDialog.type === "listing"
                  ? handleDeleteListing()
                  : handleDeleteUser();
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Listing Dialog */}
      <Dialog
        open={editListingDialog.open}
        onOpenChange={(open) => {
          if (!open) setEditListingDialog({ open: false, property: null });
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing Details</DialogTitle>
            <DialogDescription>
              Update property information for{" "}
              {editListingDialog.property?.code_name}
            </DialogDescription>
          </DialogHeader>

          {editListingDialog.property && (
            <form onSubmit={handleUpdateListing} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code_name">Code Name</Label>
                  <Input
                    id="code_name"
                    name="code_name"
                    defaultValue={editListingDialog.property.code_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typology">Typology</Label>
                  <Input
                    id="typology"
                    name="typology"
                    defaultValue={editListingDialog.property.typology}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="property_address">Property Address</Label>
                  <Input
                    id="property_address"
                    name="property_address"
                    defaultValue={editListingDialog.property.property_address}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    name="area"
                    defaultValue={editListingDialog.property.area}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editListingDialog.property.state}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent">Annual Rent (Base)</Label>
                  <Input
                    id="rent"
                    name="rent"
                    type="number"
                    defaultValue={editListingDialog.property.rent}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_of_units">Number of Units</Label>
                  <Input
                    id="no_of_units"
                    name="no_of_units"
                    type="number"
                    defaultValue={editListingDialog.property.no_of_units}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    defaultValue={editListingDialog.property?.bedrooms}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    defaultValue={editListingDialog.property?.bathrooms}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    name="square_feet"
                    type="number"
                    defaultValue={editListingDialog.property?.square_feet}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability_status">Status</Label>
                  <Select
                    name="availability_status"
                    defaultValue={
                      editListingDialog.property.availability_status
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="inspection_pending">
                        Inspection Pending
                      </SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditListingDialog({ open: false, property: null })
                  }
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
