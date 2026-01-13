"use client";

import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Bell,
  Search,
  RefreshCw,
  Plus,
  Building,
  Users,
  CreditCard,
  Home,
  LogOut,
  Settings,
  BarChart3,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLandlordData } from "@/hooks/useLandlordData";
import { PropertyCard } from "@/app/components/landlord/PropertyCard";
import { ApplicationItem } from "@/app/components/landlord/ApplicationItem";
import { AddPropertyDialog } from "@/app/components/landlord/AddPropertyDialog";

export default function LandlordDashboard() {
  const {
    user,
    logout,
    isAuthenticated,
    loading: authLoading,
    token,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [addPropertyDialog, setAddPropertyDialog] = useState(false);
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const {
    landlordData,
    properties,
    applications,
    loading: dataLoading,
    refreshData,
    setLandlordData,
  } = useLandlordData(user, token);

  useEffect(() => {
    if (landlordData) {
      setEditFormData({
        full_name: landlordData.full_name || "",
        email: user?.email || "",
        phone: landlordData.phone || "",
        residential_address: landlordData.residential_address || "",
        account_name: landlordData.account_name || "",
        account_number: landlordData.account_number || "",
        bank_name: landlordData.bank_name || "",
        designation: landlordData.designation || "",
        occupation: landlordData.occupation || "",
        nationality: landlordData.nationality || "",
        place_of_work: landlordData.place_of_work || "",
        business_name: landlordData.business_name || "",
        business_address: landlordData.business_address || "",
      });
    }
  }, [landlordData, user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    } else if (
      !authLoading &&
      user &&
      user.role !== "landlord" &&
      user.role !== "admin"
    ) {
      router.push("/profile");
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
    toast({ title: "Logged Out", description: "Successfully logged out" });
  };

  const handleUpdateProfile = async () => {
    if (!token || !user?.id) return;
    setIsSaving(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api"
        }/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLandlordData(data.data || data);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        setEditProfileDialog(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.code_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.property_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProperties: properties.length,
    occupiedUnits: properties.filter(
      (p) =>
        p.availability_status === "rented" ||
        p.availability_status === "occupied"
    ).length,
    totalUnits: properties.reduce(
      (acc, p) => acc + (p.noOfUnits || p.number_of_units || 1),
      0
    ),
    pendingApplications: applications.filter(
      (a) => a.status === "pending" || a.status === "submitted"
    ).length,
    totalRevenue: properties.reduce((acc, p) => acc + (p.monthly_cost || 0), 0),
  };

  const occupancyRate =
    stats.totalUnits > 0
      ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
      : 0;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white border-b px-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary font-raleway">
                EZ-Pay
              </span>
            </div>
          </Link>
        </div>
        <Button
          size="sm"
          onClick={() => setAddPropertyDialog(true)}
          className="bg-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col transform ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:flex`}
      >
        <div className="p-6 border-b">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary font-raleway">
                EZ-Pay
              </span>
            </div>
          </Link>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
            Landlord Portal
          </p>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "properties", label: "My Properties", icon: Building },
            { id: "applicants", label: "Applicants", icon: Users },
            { id: "finance", label: "Finance", icon: BarChart3 },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-11"
              onClick={() => {
                setActiveTab(item.id);
                setMobileSidebarOpen(false);
              }}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            onClick={() => {
              setEditProfileDialog(true);
              setMobileSidebarOpen(false);
            }}
          >
            <Settings className="h-4 w-4" /> Edit Profile
          </Button>
        </nav>
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10 border border-slate-100">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              />
              <AvatarFallback>
                {user.full_name?.charAt(0) || "L"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {landlordData?.full_name || user.full_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b px-8 items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-grow max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10 h-9 bg-slate-50 border-none focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              disabled={dataLoading.properties}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  dataLoading.properties ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <Button
              onClick={() => setAddPropertyDialog(true)}
              className="bg-primary hover:bg-primary/90 transition-all font-raleway font-bold shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Property
            </Button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold font-raleway text-slate-900">
                  Good day,{" "}
                  {landlordData?.full_name?.split(" ")[0] ||
                    user.full_name?.split(" ")[0] ||
                    "Landlord"}
                  !
                </h1>
                <p className="text-slate-500">
                  Workspace management and property insights.
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                Overall Health: Good
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Properties",
                  value: stats.totalProperties,
                  icon: Building,
                  color: "bg-blue-600 shadow-blue-200",
                },
                {
                  label: "Occupancy Rate",
                  value: `${occupancyRate}%`,
                  icon: Home,
                  color: "bg-emerald-600 shadow-emerald-200",
                },
                {
                  label: "Pending Apps",
                  value: stats.pendingApplications,
                  icon: Users,
                  color: "bg-amber-600 shadow-amber-200",
                },
                {
                  label: "Monthly Revenue",
                  value: `₦${stats.totalRevenue.toLocaleString()}`,
                  icon: CreditCard,
                  color: "bg-violet-600 shadow-violet-200",
                },
              ].map((s, i) => (
                <Card
                  key={i}
                  className="border-none shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {s.label}
                      </p>
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mt-1">
                        {s.value}
                      </h3>
                    </div>
                    <div
                      className={`${s.color} p-3 rounded-xl text-white shadow-lg`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Properties List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 font-raleway">
                    My Properties
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => setActiveTab("properties")}
                  >
                    View All
                  </Button>
                </div>

                {dataLoading.properties ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-slate-400">Fetching properties...</p>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <Card className="border-dashed border-2 py-12 text-center">
                    <CardContent className="space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Building className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500">
                        {searchTerm
                          ? "No match found."
                          : "No properties listed yet."}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setAddPropertyDialog(true)}>
                          Add Your First Property
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredProperties.map((p) => (
                      <PropertyCard
                        key={p.id}
                        property={p}
                        onViewDetails={(id) => router.push(`/listings/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: Applications & Summary */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 font-raleway">
                    Recent Activity
                  </h2>
                  {dataLoading.applications ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : applications.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10 bg-white rounded-2xl border border-dashed">
                      No recent activity.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((a) => (
                        <ApplicationItem
                          key={a.id}
                          application={a}
                          onClick={(id) => router.push(`/applications/${id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative group">
                  <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                    <ClipboardCheck className="h-32 w-32" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <h4 className="font-bold text-lg mb-2">
                      Portfolio Insight
                    </h4>
                    <p className="text-sm text-primary-foreground/80 mb-6">
                      You have {stats.pendingApplications} pending applications.
                      Faster responses typically lead to higher conversion.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full font-bold"
                      onClick={() => setActiveTab("applicants")}
                    >
                      Go to Applications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      {addPropertyDialog && (
        <AddPropertyDialog
          open={addPropertyDialog}
          onOpenChange={setAddPropertyDialog}
          token={token}
          user_id={user.id}
          onSuccess={refreshData}
          toast={toast}
        />
      )}

      <Dialog open={editProfileDialog} onOpenChange={setEditProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-raleway font-bold">
              Landlord Profile
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={editFormData.full_name || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    full_name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={editFormData.email || ""}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                value={editFormData.phone || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input
                value={editFormData.occupation || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    occupation: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Residential Address *</Label>
              <Textarea
                value={editFormData.residential_address || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    residential_address: e.target.value,
                  })
                }
                rows={3}
                required
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Settlement Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Name *</Label>
                  <Input
                    value={editFormData.account_name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        account_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number *</Label>
                  <Input
                    value={editFormData.account_number || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        account_number: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Bank Name *</Label>
                  <Input
                    value={editFormData.bank_name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        bank_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button
              variant="outline"
              onClick={() => setEditProfileDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="bg-primary"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
