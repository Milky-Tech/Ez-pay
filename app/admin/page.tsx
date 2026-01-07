"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PropertyReviewDialog from "./components/PropertyReviewDialog";
import OverviewTab from "./components/OverviewTab";
import PropertiesTab from "./components/PropertiesTab";
import ApplicationsTab from "./components/ApplicationsTab";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

// Interface definitions
interface Property {
  id: string;
  code_name: string;
  topology: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  availability_status: string;
  status?: string; // Submission status: approved, pending, in_review, etc.
  fullName: string;
  property_address: string;
  noOfUnits: number;
  rent: number;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  property_id: string;
  status: string;
  payment_plan_preference: string;
  created_at: string;
  properties?: Property;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface Landlord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

// Helper function for price formatting

// Helper function for price formatting
const formatPrice = (price: number | null) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
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
  const { user, isAuthenticated, logout, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch data based on active tab

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
      const response = await fetch(
        `${API_BASE_URL}/landlords/property/properties`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }

      const data = await response.json();
      setProperties(data.data || data);
      // Update stats
      const approvedCount = (data.data || data).filter(
        (p: Property) => p.status === "approved"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalProperties: (data.data || data).length,
        availableProperties: approvedCount,
      }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      // // For development, use mock data
      // if (process.env.NODE_ENV === "development") {
      //   const mockProperties: Property[] = [
      //     {
      //       id: "1",
      //       code_name: "BG-001",
      //       typology: "Flat",
      //       area: "Lekki",
      //       state: "Lagos",
      //       monthly_cost: 1500000,
      //       availability_status: "available",
      //       fullName: "John Adewale Okafor",
      //       property_address: "Plot 23, Lekki Phase 1, Lagos",
      //       no_of_units: 12,
      //       rent: 1800000,
      //       created_at: new Date().toISOString(),
      //       updated_at: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       code_name: "BG-002",
      //       typology: "Duplex",
      //       area: "Victoria Island",
      //       state: "Lagos",
      //       monthly_cost: 2500000,
      //       availability_status: "rented",
      //       fullName: "Chinwe Okonkwo",
      //       property_address: "45 Marina Road, Lagos Island",
      //       no_of_units: 6,
      //       rent: 3000000,
      //       created_at: new Date().toISOString(),
      //       updated_at: new Date().toISOString(),
      //     },
      //   ];
      //   setProperties(mockProperties);
      //   setStats((prev) => ({
      //     ...prev,
      //     totalProperties: mockProperties.length,
      //     availableProperties: mockProperties.filter(
      //       (p) => p.availability_status === "available"
      //     ).length,
      //   }));
      // }
    } finally {
      setLoading((prev) => ({ ...prev, properties: false }));
    }
  }, [token]);

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
      console.log(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      // For development, use mock data
      if (process.env.NODE_ENV === "development") {
        const mockListings: Property[] = [
          {
            id: "1",
            code_name: "BG-001",
            topology: "Flat",
            area: "Lekki",
            state: "Lagos",
            monthly_cost: 1500000,
            availability_status: "available",
            fullName: "John Adewale Okafor",
            property_address: "Plot 23, Lekki Phase 1, Lagos",
            noOfUnits: 12,
            rent: 1800000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setListings(mockListings);
      }
    } finally {
      setLoading((prev) => ({ ...prev, listings: false }));
    }
  }, [token]);

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, applications: true }));
      // Assuming there's an endpoint for applications
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        // If endpoint doesn't exist yet, use mock data
        throw new Error("Applications endpoint not available");
      }

      const data = await response.json();
      setApplications(data.data || data);

      const pendingCount = (data.data || data).filter(
        (app: Application) =>
          app.status === "submitted" || app.status === "vetting_pending"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalApplications: (data.data || data).length,
        pendingApplications: pendingCount,
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Mock data for development
      if (process.env.NODE_ENV === "development") {
        const mockApplications: Application[] = [
          {
            id: "1",
            property_id: "1",
            status: "vetting_pending",
            payment_plan_preference: "ez_anchor",
            created_at: new Date().toISOString(),
            fullName: "Adebayo Johnson",
            email: "adebayo@example.com",
            phone: "08012345678",
          },
          {
            id: "2",
            property_id: "2",
            status: "approved",
            payment_plan_preference: "ez_ascend",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            fullName: "Chioma Nwosu",
            email: "chioma@example.com",
            phone: "08087654321",
          },
        ];
        setApplications(mockApplications);
        setStats((prev) => ({
          ...prev,
          totalApplications: mockApplications.length,
          pendingApplications: mockApplications.filter(
            (app) =>
              app.status === "vetting_pending" || app.status === "submitted"
          ).length,
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, applications: false }));
    }
  }, []);

  // Fetch all users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.data || data); // Using users state for users tab

      const activeCount = (data.data || data).filter(
        (u: any) => u.status === "active"
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

  // Fetch landlords from API (only those with approved properties)
  const fetchLandlords = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, landlords: true }));

      // First fetch all properties to identify landlords with approved properties
      const propertiesResponse = await fetch(
        `${API_BASE_URL}/landlords/property/properties`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        }
      );

      if (!propertiesResponse.ok) {
        throw new Error(
          `Failed to fetch properties: ${propertiesResponse.statusText}`
        );
      }

      const propertiesData = await propertiesResponse.json();
      const allProperties = propertiesData.data || propertiesData;

      // Get unique landlord names who have at least one approved property
      const approvedLandlordNames = Array.from(
        new Set(
          allProperties
            .filter(
              (property: Property) =>
                property.availability_status === "approved" ||
                property.availability_status === "active"
            )
            .map((property: Property) => property.fullName)
        )
      );

      // Now fetch all landlords
      const landlordsResponse = await fetch(`${API_BASE_URL}/landlords`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });

      if (!landlordsResponse.ok) {
        throw new Error(
          `Failed to fetch landlords: ${landlordsResponse.statusText}`
        );
      }

      const landlordsData = await landlordsResponse.json();
      const allLandlords = landlordsData.data || landlordsData;

      // Filter landlords who have approved properties
      const verifiedLandlords = allLandlords.filter((landlord: Landlord) =>
        approvedLandlordNames.includes(landlord.fullName)
      );

      setLandlords(verifiedLandlords);

      const activeCount = verifiedLandlords.filter(
        (landlord: Landlord) => landlord.status === "active"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalLandlords: verifiedLandlords.length,
        activeLandlords: activeCount,
      }));
    } catch (error) {
      console.error("Error fetching verified landlords:", error);
      // For development, use mock data
      if (process.env.NODE_ENV === "development") {
        const mockVerifiedLandlords: Landlord[] = [
          {
            id: "1",
            fullName: "John Adewale Okafor",
            email: "john.okafors@example.com",
            phone: "+2348012345678",
            status: "active",
            createdAt: new Date().toISOString(),
          },
        ];
        setLandlords(mockVerifiedLandlords);
        setStats((prev) => ({
          ...prev,
          totalLandlords: mockVerifiedLandlords.length,
          activeLandlords: mockVerifiedLandlords.filter(
            (l) => l.status === "active"
          ).length,
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, landlords: false }));
    }
  }, [token]);

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

  // Update User
  const updateUser = async (userId: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast({
        title: "User Updated",
        description: "User details have been successfully updated.",
      });

      // Refresh data
      if (activeTab === "users") fetchUsers();
      else if (activeTab === "landlords") fetchLandlords();

      return true;
    } catch (error) {
      console.error("Update user error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the user.",
      });
      return false;
    }
  };

  // Delete User
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });

      // Refresh data
      if (activeTab === "users") fetchUsers();
      else if (activeTab === "landlords") fetchLandlords();

      return true;
    } catch (error) {
      console.error("Delete user error:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the user.",
      });
      return false;
    }
  };

  // Update Property Status
  const updatePropertyStatus = async (propertyId: string, status: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/landlords/property/${propertyId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Status Updated",
        description: "Property status has been updated.",
      });

      fetchProperties();
      return true;
    } catch (error) {
      console.error("Update status error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the property status.",
      });
      return false;
    }
  };

  // Update Application Status
  const updateApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update application status");

      toast({
        title: "Status Updated",
        description: "Application status has been updated.",
      });

      fetchApplications();
      return true;
    } catch (error) {
      console.error("Update application error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the application status.",
      });
      return false;
    }
  };

  // Approve Property Submission
  const approveProperty = async (property: Property) => {
    try {
      // First approve the property
      const response = await fetch(
        `${API_BASE_URL}/landlords/property/${property.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "approved" }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve property");

      // Register the landlord
      const landlordData = {
        fullName: property.fullName,
        email: `${property.fullName
          .toLowerCase()
          .replace(/\s+/g, ".")}@ezpay.com`,
        phone: "09000000000",
        password: "12345678",
        password_confirmation: "12345678",
        company_name: `${property.fullName} Housing`,
        address: property.property_address,
        nin: "12345678901",
        account_name: property.fullName,
        account_number: "2045678901",
        bank_name: "First Bank",
      };

      const landlordResponse = await fetch(`${API_BASE_URL}/landlords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify(landlordData),
      });

      if (!landlordResponse.ok) {
        console.warn(
          "Failed to register landlord, but property was approved:",
          landlordResponse.statusText
        );
        // Don't throw error here, as the property approval succeeded
      }

      toast({
        title: "Property Approved",
        description:
          "Property submission has been approved and landlord registered.",
      });

      fetchProperties();
      fetchListings();
      fetchLandlords(); // Refresh landlords list
      return true;
    } catch (error) {
      console.error("Approve property error:", error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "There was an error approving the property.",
      });
      return false;
    }
  };

  // Reject Property Submission
  const rejectProperty = async (propertyId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/landlords/property/${propertyId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "rejected" }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject property");

      toast({
        title: "Property Rejected",
        description: "Property submission has been rejected.",
      });

      fetchProperties();
      return true;
    } catch (error) {
      console.error("Reject property error:", error);
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "There was an error rejecting the property.",
      });
      return false;
    }
  };

  // Filter properties based on search and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      searchTerm === "" ||
      property.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter listings based on search and status
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      searchTerm === "" ||
      (listing.id?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (listing.area?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (listing.fullName?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || listing.availability_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter applications
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      searchTerm === "" ||
      (application.properties?.id?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (application.fullName?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter landlords
  const filteredLandlords = landlords.filter((landlord) => {
    const matchesSearch =
      searchTerm === "" ||
      (landlord.fullName?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (landlord.email?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || landlord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      (user.fullName?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.email?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

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

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
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
      default:
        fetchDashboardData();
        break;
    }
  };

  // Fix the conditional redirect
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Safely handle user.fullName
  const userName = user?.fullName ? user.fullName.toUpperCase() : "ADMIN";

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
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">Submit</span>
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
            <OverviewTab
              stats={stats}
              properties={properties}
              applications={applications}
              loading={loading}
              getStatusBadge={getStatusBadge}
              formatPrice={formatPrice}
              formatDate={formatDate}
              fetchProperties={fetchProperties}
              fetchApplications={fetchApplications}
            />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesTab
              properties={properties}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              getStatusBadge={getStatusBadge}
              formatPrice={formatPrice}
              fetchProperties={fetchProperties}
              approveProperty={approveProperty}
              rejectProperty={rejectProperty}
            />
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
                                {listing.topology}
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
                            <TableCell>{listing.noOfUnits}</TableCell>
                            <TableCell>
                              {getStatusBadge(listing.availability_status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
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
            <ApplicationsTab
              applications={applications}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              fetchApplications={fetchApplications}
              updateApplicationStatus={updateApplicationStatus}
            />
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
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                                className="text-destructive hover:text-destructive"
                                title="Delete User"
                                onClick={() => deleteUser(user.id)}
                              >
                                <XCircle className="h-4 w-4" />
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
                  <CardTitle className="font-raleway">
                    Landlord Submissions
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Manage property owners and their registrations
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
                            {landlord.fullName}
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
                            {formatDate(landlord.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Submission
                            </Button>
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
    </div>
  );
}
