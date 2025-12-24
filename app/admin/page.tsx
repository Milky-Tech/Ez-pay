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
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = "https://ez-pay.realestway.com/api";

type Property = {
  id: string;
  code_name: string;
  typology: string;
  area: string;
  state: string;
  monthly_cost: number;
  availability_status: string;
  created_at: string;
};

type Application = {
  id: string;
  property_code: string;
  property_type: string;
  created_at: string;
  status: string;
  payment_plan_preference: string;
  applicant_name?: string;
  property?: {
    code_name: string;
    typology: string;
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo data (replace with actual API calls)
  const demoProperties: Property[] = [
    {
      id: "1",
      code_name: "EZ-HS-001",
      typology: "3-Bedroom Flat",
      area: "Lekki",
      state: "Lagos",
      monthly_cost: 1200000,
      availability_status: "available",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      code_name: "EZ-HS-002",
      typology: "4-Bedroom Duplex",
      area: "Victoria Island",
      state: "Lagos",
      monthly_cost: 2500000,
      availability_status: "rented",
      created_at: "2024-01-10T14:20:00Z",
    },
    {
      id: "3",
      code_name: "EZ-HS-003",
      typology: "2-Bedroom Flat",
      area: "Ikeja",
      state: "Lagos",
      monthly_cost: 800000,
      availability_status: "available",
      created_at: "2024-01-05T09:15:00Z",
    },
    {
      id: "4",
      code_name: "EZ-HS-004",
      typology: "5-Bedroom Duplex",
      area: "Abuja",
      state: "FCT",
      monthly_cost: 3500000,
      availability_status: "maintenance",
      created_at: "2024-01-20T16:45:00Z",
    },
  ];

  const demoApplications: Application[] = [
    {
      id: "1",
      property_code: "EZ-HS-001",
      property_type: "3-Bedroom Flat",
      created_at: "2024-01-20T14:45:00Z",
      status: "vetting_pending",
      payment_plan_preference: "ez_anchor",
      applicant_name: "John Doe",
    },
    {
      id: "2",
      property_code: "EZ-HS-003",
      property_type: "2-Bedroom Flat",
      created_at: "2024-01-18T11:30:00Z",
      status: "approved",
      payment_plan_preference: "ez_ascend",
      applicant_name: "Jane Smith",
    },
    {
      id: "3",
      property_code: "EZ-HS-001",
      property_type: "3-Bedroom Flat",
      created_at: "2024-01-22T09:15:00Z",
      status: "submitted",
      payment_plan_preference: "ez_anchor",
      applicant_name: "Robert Johnson",
    },
    {
      id: "4",
      property_code: "EZ-HS-002",
      property_type: "4-Bedroom Duplex",
      created_at: "2024-01-12T16:20:00Z",
      status: "rejected",
      payment_plan_preference: "ez_ascend",
      applicant_name: "Sarah Williams",
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    // For now, use demo data
    // TODO: Replace with actual API calls when backend is ready
    fetchDashboardData();
  }, [isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API calls
      // Example API calls (commented out for now):
      /*
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch properties from API
      const propertiesResponse = await fetch(`${API_BASE}/admin/properties`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!propertiesResponse.ok) {
        throw new Error("Failed to fetch properties");
      }

      const propertiesData = await propertiesResponse.json();
      setProperties(propertiesData);

      // Fetch applications from API
      const applicationsResponse = await fetch(`${API_BASE}/admin/applications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!applicationsResponse.ok) {
        throw new Error("Failed to fetch applications");
      }

      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData);
      */

      // Use demo data for now
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      setProperties(demoProperties);
      setApplications(demoApplications);

      // Calculate stats
      const availableProperties = demoProperties.filter(
        (p) => p.availability_status === "available"
      ).length;

      const pendingApplications = demoApplications.filter(
        (a) => a.status === "vetting_pending" || a.status === "submitted"
      ).length;

      setStats({
        totalProperties: demoProperties.length,
        availableProperties,
        totalApplications: demoApplications.length,
        pendingApplications,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, status: string) => {
    try {
      // TODO: Replace with actual API call
      // Example API call (commented out for now):
      /*
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE}/admin/properties/${propertyId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update property");
      }
      */

      // Update locally for demo
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, availability_status: status } : p
        )
      );

      // Recalculate stats
      const availableProperties = properties
        .map((p) =>
          p.id === propertyId ? { ...p, availability_status: status } : p
        )
        .filter((p) => p.availability_status === "available").length;

      setStats((prev) => ({
        ...prev,
        availableProperties,
      }));

      alert("Property status updated successfully!");
    } catch (error) {
      console.error("Error updating property:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update property status"
      );
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      // TODO: Replace with actual API call
      // Example API call (commented out for now):
      /*
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE}/admin/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update application");
      }
      */

      // Update locally for demo
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );

      // Recalculate stats
      const pendingApplications = applications
        .map((app) => (app.id === applicationId ? { ...app, status } : app))
        .filter(
          (a) => a.status === "vetting_pending" || a.status === "submitted"
        ).length;

      setStats((prev) => ({
        ...prev,
        pendingApplications,
      }));

      alert("Application status updated successfully!");
    } catch (error) {
      console.error("Error updating application:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update application status"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      available: { variant: "secondary", label: "Available" },
      rented: { variant: "default", label: "Rented" },
      maintenance: { variant: "outline", label: "Maintenance" },
      submitted: { variant: "outline", label: "Submitted" },
      vetting_pending: { variant: "outline", label: "Vetting" },
      approved: { variant: "secondary", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-open-sans">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} className="font-montserrat">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold font-raleway flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <Link href="/" className="hover:opacity-80 transition">
                  Bridgent HomeStep Admin
                </Link>
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Welcome, {user?.full_name || "Admin"}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm bg-primary/20 px-3 py-1 rounded-full">
                Role: {user?.role || "Administrator"}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10 font-montserrat"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Review
                  </CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {stats.pendingApplications}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-raleway">
                    Recent Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          <p className="text-xs text-gray-600">
                            {property.typology} - {property.area}
                          </p>
                        </div>
                        {getStatusBadge(property.availability_status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-raleway">
                    Recent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between pb-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-sm">
                            {app.property_code || "Property"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-raleway">
                    Property Management
                  </CardTitle>
                  <Button className="bg-primary font-montserrat">
                    Add New Property
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search properties..."
                    className="max-w-sm"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Monthly Rent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">
                            {property.code_name || "Pending"}
                          </TableCell>
                          <TableCell>{property.typology}</TableCell>
                          <TableCell>
                            {property.area}, {property.state}
                          </TableCell>
                          <TableCell>
                            {formatPrice(property.monthly_cost)}
                          </TableCell>
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
                                      <Label>Property Status</Label>
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
                <div className="mb-4 flex gap-4">
                  <Input
                    placeholder="Search applications..."
                    className="max-w-sm"
                  />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="vetting_pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Application Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Plan</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {app.property_code || "N/A"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {app.property_type}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {app.payment_plan_preference === "ez_anchor"
                                ? "EZ-Anchor"
                                : "EZ-Ascend"}
                            </Badge>
                          </TableCell>
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
                                    <div>
                                      <Label>Update Status</Label>
                                      <Select
                                        onValueChange={(value) =>
                                          updateApplicationStatus(app.id, value)
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-raleway">Landlords</CardTitle>
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Manage landlord profiles and partnerships
                  </p>
                  <Button className="mt-4 w-full" variant="outline">
                    View All Landlords
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-raleway">Tenants</CardTitle>
                    <UserCheck className="h-5 w-5 text-gray-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Manage tenant profiles and leases
                  </p>
                  <Button className="mt-4 w-full" variant="outline">
                    View All Tenants
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
