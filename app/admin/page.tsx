"use client";

import { useState, useEffect } from "react";
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

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

// Interface definitions
interface Property {
  id: string;
  code_name: string;
  typology: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  availability_status: string;
  full_name: string;
  property_address: string;
  no_of_units: number;
  rent: number;
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

interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalAgents: 0,
    activeAgents: 0,
  });
  const [loading, setLoading] = useState({
    properties: false,
    applications: false,
    agents: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, isAuthenticated, logout, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch data based on active tab
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
      case "agents":
        fetchAgents();
        break;
      default:
        fetchDashboardData();
        break;
    }
  }, [activeTab, isAuthenticated, router]);

  // Fetch all dashboard data for overview
  const fetchDashboardData = async () => {
    try {
      setLoading((prev) => ({ ...prev, properties: true, applications: true }));
      await Promise.all([fetchProperties(), fetchApplications()]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading((prev) => ({
        ...prev,
        properties: false,
        applications: false,
      }));
    }
  };

  // Fetch properties from API
  const fetchProperties = async () => {
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
      console.log(data);
      // Update stats
      const availableCount = (data.data || data).filter(
        (p: Property) =>
          p.availability_status === "available" ||
          p.availability_status === "active"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalProperties: (data.data || data).length,
        availableProperties: availableCount,
      }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      // For development, use mock data
      if (process.env.NODE_ENV === "development") {
        const mockProperties: Property[] = [
          {
            id: "1",
            code_name: "BG-001",
            typology: "Flat",
            area: "Lekki",
            state: "Lagos",
            monthly_cost: 1500000,
            availability_status: "available",
            full_name: "John Adewale Okafor",
            property_address: "Plot 23, Lekki Phase 1, Lagos",
            no_of_units: 12,
            rent: 1800000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            code_name: "BG-002",
            typology: "Duplex",
            area: "Victoria Island",
            state: "Lagos",
            monthly_cost: 2500000,
            availability_status: "rented",
            full_name: "Chinwe Okonkwo",
            property_address: "45 Marina Road, Lagos Island",
            no_of_units: 6,
            rent: 3000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setProperties(mockProperties);
        setStats((prev) => ({
          ...prev,
          totalProperties: mockProperties.length,
          availableProperties: mockProperties.filter(
            (p) => p.availability_status === "available"
          ).length,
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, properties: false }));
    }
  };

  // Fetch applications from API
  const fetchApplications = async () => {
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
            full_name: "Adebayo Johnson",
            email: "adebayo@example.com",
            phone: "08012345678",
          },
          {
            id: "2",
            property_id: "2",
            status: "approved",
            payment_plan_preference: "ez_ascend",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            full_name: "Chioma Nwosu",
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
  };

  // Fetch all users from API
  const fetchUsers = async () => {
    try {
      setLoading((prev) => ({ ...prev, agents: true }));
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
      setAgents(data.data || data); // Using agents state for now to reuse table

      const activeCount = (data.data || data).filter(
        (u: any) => u.status === "active"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalAgents: (data.data || data).length,
        activeAgents: activeCount,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  };

  // Fetch agents (landlords) from API
  const fetchAgents = async () => {
    try {
      setLoading((prev) => ({ ...prev, agents: true }));
      const response = await fetch(`${API_BASE_URL}/agent`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data.data || data);

      const activeCount = (data.data || data).filter(
        (agent: Agent) => agent.status === "active"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalAgents: (data.data || data).length,
        activeAgents: activeCount,
      }));
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  };

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
      else if (activeTab === "agents") fetchAgents();

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
      else if (activeTab === "agents") fetchAgents();

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
          method: "PATCH",
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

  // Filter properties based on search and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      searchTerm === "" ||
      property.code_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.availability_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter applications
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      searchTerm === "" ||
      (application.properties?.code_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (application.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      searchTerm === "" ||
      agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

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
        fetchAgents();
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
              loading.properties || loading.applications || loading.agents
            }
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                loading.properties || loading.applications || loading.agents
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
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="font-montserrat">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="font-montserrat">
              <Home className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="applications" className="font-montserrat">
              <FileText className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="users" className="font-montserrat">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="agents" className="font-montserrat">
              <UserCheck className="h-4 w-4 mr-2" />
              Landlords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Properties
                  </CardTitle>
                  <Home className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalProperties}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.availableProperties} available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Available
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">
                    {stats.availableProperties}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ready for tenants
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Applications
                  </CardTitle>
                  <FileText className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalApplications}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pendingApplications} pending
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Agents
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {stats.activeAgents}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    out of {stats.totalAgents} total
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-raleway">
                      Recent Properties
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchProperties}
                      disabled={loading.properties}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.properties ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        Loading properties...
                      </p>
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
                      <p className="text-gray-500 mt-2">No properties found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.slice(0, 5).map((property) => (
                        <div
                          key={property.id}
                          className="flex items-center justify-between pb-3 border-b last:border-0"
                        >
                          <div>
                            <p className="font-semibold text-sm">
                              {property.code_name || "Pending Code"}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.area}, {property.state}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Owner: {property.full_name}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(property.availability_status)}
                            <p className="text-xs font-semibold text-primary">
                              {formatPrice(property.monthly_cost)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-raleway">
                      Recent Applications
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchApplications}
                      disabled={loading.applications}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.applications ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        Loading applications...
                      </p>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
                      <p className="text-gray-500 mt-2">
                        No applications found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between pb-3 border-b last:border-0"
                        >
                          <div>
                            <p className="font-semibold text-sm">
                              {app.properties?.code_name || "Property"}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {app.full_name || "Applicant"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(app.created_at)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(app.status)}
                            <Badge variant="outline" className="text-xs">
                              {app.payment_plan_preference === "ez_anchor"
                                ? "EZ-Anchor"
                                : "EZ-Ascend"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="font-raleway">
                    Property Management
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
                    <Button className="bg-primary font-montserrat">
                      Add New Property
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
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
                        ? "No properties match your search criteria"
                        : "No properties found. Add your first property to get started."}
                    </p>
                    <Button className="mt-4">Add Property</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Monthly Rent</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">
                              {property.code_name || "PENDING"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {property.typology}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {property.area}, {property.state}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[150px] truncate">
                                {property.full_name}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(property.monthly_cost)}
                            </TableCell>
                            <TableCell>{property.no_of_units}</TableCell>
                            <TableCell>
                              {getStatusBadge(property.availability_status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Update Property Status
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>
                                          Property: {property.code_name}
                                        </Label>
                                        <p className="text-sm text-gray-600">
                                          {property.property_address}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Current Status</Label>
                                        <div className="mt-1">
                                          {getStatusBadge(
                                            property.availability_status
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Update Status</Label>
                                        <Select
                                          defaultValue={
                                            property.availability_status
                                          }
                                          onValueChange={(value) =>
                                            updatePropertyStatus(
                                              property.id,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="available">
                                              Available
                                            </SelectItem>
                                            <SelectItem value="rented">
                                              Rented
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                              Maintenance
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
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
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="font-raleway">
                    Rental Applications
                  </CardTitle>
                  <Button
                    onClick={fetchApplications}
                    variant="outline"
                    size="sm"
                    disabled={loading.applications}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loading.applications ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search applications by property, applicant name, or email..."
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
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="vetting_pending">
                        Vetting Pending
                      </SelectItem>
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
                    <p className="text-gray-500 mt-4">
                      {searchTerm || statusFilter !== "all"
                        ? "No applications match your search criteria"
                        : "No applications found."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Application Date</TableHead>
                          <TableHead>Payment Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {app.properties?.code_name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {app.properties?.typology}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {app.full_name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ID: {app.id.substring(0, 8)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-xs">{app.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-xs">{app.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(app.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {app.payment_plan_preference === "ez_anchor"
                                  ? "EZ-Anchor"
                                  : "EZ-Ascend"}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Application Review
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-semibold">
                                            Applicant
                                          </Label>
                                          <p>{app.full_name}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-semibold">
                                            Property
                                          </Label>
                                          <p>{app.properties?.code_name}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-semibold">
                                            Email
                                          </Label>
                                          <p>{app.email}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-semibold">
                                            Phone
                                          </Label>
                                          <p>{app.phone}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Payment Plan Preference</Label>
                                        <p className="font-medium">
                                          {app.payment_plan_preference ===
                                          "ez_anchor"
                                            ? "EZ-Anchor (Pay monthly)"
                                            : "EZ-Ascend (Pay annually)"}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Update Status</Label>
                                        <Select
                                          defaultValue={app.status}
                                          onValueChange={(value) =>
                                            updateApplicationStatus(
                                              app.id,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="vetting_pending">
                                              Vetting Pending
                                            </SelectItem>
                                            <SelectItem value="approved">
                                              Approve
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                              Reject
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Admin Notes</Label>
                                        <Textarea placeholder="Add notes about this application..." />
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
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
                {loading.agents ? (
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
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">
                            {agent.full_name}
                          </TableCell>
                          <TableCell>{agent.email}</TableCell>
                          <TableCell>{agent.phone}</TableCell>
                          <TableCell>{getStatusBadge(agent.status)}</TableCell>
                          <TableCell>{formatDate(agent.created_at)}</TableCell>
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
                                onClick={() => deleteUser(agent.id)}
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

          <TabsContent value="agents">
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
                {loading.agents ? (
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
                      {filteredAgents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">
                            {agent.full_name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{agent.email}</p>
                              <p className="text-gray-500">{agent.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(agent.status)}</TableCell>
                          <TableCell>{formatDate(agent.created_at)}</TableCell>
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
