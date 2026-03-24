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
  CreditCard,
  Home,
  LogOut,
  Settings,
  BarChart3,
  Loader2,
  ClipboardCheck,
  AlertTriangle,
  Shield,
  Upload,
  Trash2,
  Paperclip,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLandlordData } from "@/hooks/useLandlordData";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ApplicationItem } from "@/app/components/landlord/ApplicationItem";
import PropertiesTab from "@/app/components/landlord/PropertiesTab";
import AddPropertyView from "@/app/components/landlord/AddPropertyView";
import { getCurrentLocation } from "@/lib/geolocation";

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
  const [isSaving, setIsSaving] = useState(false);
  const {
    landlordData,
    properties,
    drafts,
    applications,
    loading: dataLoading,
    refreshData,
    setLandlordData,
  } = useLandlordData(user, token);

  const { handleFileUpload, uploadedFiles } = useFileUpload(token);

  const [editFormData, setEditFormData] = useState<any>({});
  const [draftData, setDraftData] = useState<any>({
    property_address: "",
    state: "",
    area: "",
    typology: "",
  });
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const calculateCompletion = () => {
    if (!editFormData || Object.keys(editFormData).length === 0) return 0;

    const baseFields = [
      "full_name",
      "phone",
      "residential_address",
      "occupation",
      "nationality",
      "lga_of_origin",
      "state_of_origin",
      "designation",
    ];

    let totalFields = [...baseFields];
    if (editFormData.designation === "business") {
      totalFields.push("business_name", "business_address", "cac_cert");
    } else if (editFormData.designation === "employee") {
      totalFields.push("place_of_work");
    }

    const completedFields = totalFields.filter((field) => {
      const value = editFormData[field];
      return value && value.toString().trim() !== "";
    });

    return Math.round((completedFields.length / totalFields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isProfileComplete = completionPercentage === 100;

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
        lga_of_origin: landlordData.lga_of_origin || "",
        state_of_origin: landlordData.state_of_origin || "",
        place_of_work: landlordData.place_of_work || "",
        business_name: landlordData.business_name || "",
        business_address: landlordData.business_address || "",
        cac_cert: landlordData.cac_cert || "",
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
          process.env.NEXT_PUBLIC_API_URL }/landlords/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        },
      );
      if (response.ok) {
        const data = await response.json();
        setLandlordData(data.data || data);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        setActiveTab("dashboard");
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

  const handleCreateDraft = async () => {
    if (!token || !user?.id) return;
    
    if (!draftData.property_address || !draftData.state || !draftData.area || !draftData.typology) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide the state, area, property type, and property address.",
      });
      return;
    }

    setIsCreatingDraft(true);
    try {
      let locationData = null;
      try {
        locationData = await getCurrentLocation();
      } catch (locError) {
        console.warn("Failed to capture location during draft creation:", locError);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/listings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...draftData,
            landlord_id: user.id,
            is_draft: true,
            landlord_package: "prime",
            locationData: locationData,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const propertyId = result.data?.id || result.id;
        
        if (typeof window !== "undefined") {
          localStorage.setItem(`draft_${propertyId}`, JSON.stringify(result.data || result));
        }
        
        router.push(`/listings/${propertyId}/edit`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create draft");
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Draft Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create draft",
      });
    } finally {
      setIsCreatingDraft(false);
    }
  };
  

  const filteredProperties = properties.filter(
    (p) =>
      p.code_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.property_address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    totalProperties: properties.length,
    occupiedUnits: properties.filter(
      (p) =>
        p.listing_status === "rented"
    ).length,
    totalUnits: properties.reduce(
      (acc, p) => acc + (p.number_of_units || 1),
      0,
    ),
    pendingApplications: applications.filter(
      (a) => a.status === "pending",
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
    <div className="max-h-screen bg-slate-50 flex flex-col lg:flex-row">
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
        {isProfileComplete && (
          <Button
            size="sm"
            onClick={() => {
              setActiveTab("properties");
              // We'll let PropertiesTab handle its own Add Property button or provide a way to trigger it
              // For simplicity, switching to properties tab is a good start, or add-property tab if available
              setMobileSidebarOpen(false);
            }}
            className="bg-primary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
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
        className={`fixed lg:relative inset-y-0 h-screen left-0 z-40 w-64 bg-white border-r flex flex-col transform ${
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
            { id: "finance", label: "Finance", icon: BarChart3 },
            { id: "settings", label: "Profile Settings", icon: Settings },
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
      <main className="flex-grow flex flex-col min-w-0 overflow-scroll">
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
            {isProfileComplete && (
              <Button
                onClick={() => setActiveTab("add-property")}
                className="bg-primary hover:bg-primary/90 transition-all font-raleway font-bold shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Property
              </Button>
            )}
            {!isProfileComplete && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1.5 flex items-center gap-2"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Complete Profile to add Property
              </Badge>
            )}
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {activeTab === "dashboard" && (
              <>
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
                  <Badge
                    className={`px-3 py-1 ${isProfileComplete ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-100 text-amber-700 border-amber-200"}`}
                  >
                    Overall Health:{" "}
                    {isProfileComplete ? "Good" : "Needs Completion"}
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
                  {/* Quick Actions or Placeholders if needed */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* You could add a quick guide or empty state summary here */}
                  </div>

                  <div className="space-y-8">
                    <Card
                      className={`${isProfileComplete ? "bg-primary" : "bg-slate-900"} text-white border-none shadow-xl overflow-hidden relative group`}
                    >
                      <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        {isProfileComplete ? (
                          <ClipboardCheck className="h-32 w-32" />
                        ) : (
                          <Settings className="h-32 w-32" />
                        )}
                      </div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">
                            {isProfileComplete
                              ? "Portfolio Insight"
                              : "Profile Completion"}
                          </h4>
                          <span className="text-2xl font-black">
                            {completionPercentage}%
                          </span>
                        </div>

                        {!isProfileComplete ? (
                          <>
                            <p className="text-sm text-slate-300 mb-6">
                              Your profile is still incomplete. Complete all
                              details to unlock property uploads and management
                              features.
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                              ></div>
                            </div>
                            <Button
                              variant="secondary"
                              className="w-full font-bold bg-white text-slate-900 hover:bg-slate-100"
                              onClick={() => setActiveTab("settings")}
                            >
                              Finish Setup
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-primary-foreground/80 mb-6">
                              Your profile is complete! You can now upload and manage your properties efficiently.
                            </p>
                            <Button
                              variant="secondary"
                              className="w-full font-bold"
                              onClick={() => setActiveTab("properties")}
                            >
                              Manage Properties
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {activeTab === "properties" && (
              <PropertiesTab 
                properties={properties} 
                drafts={drafts}
                loading={dataLoading.properties} 
                onAddProperty={() => {
                  if (isProfileComplete) {
                    setActiveTab("add-property");
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Profile Incomplete",
                      description: "Please complete your profile to 100% before adding a property.",
                    });
                    setActiveTab("settings");
                  }
                }}
                onViewDetails={(id, status) => {
                  if (status !== "approved") {
                    router.push(`/landlord/listings/${id}/preview`);
                  } else {
                    router.push(`/listings/${id}`);
                  }
                }}
                onEditDraft={(id) => router.push(`/listings/${id}/edit`)}
              />
            )}

            {activeTab === "add-property" && (
              isProfileComplete ? (
                <AddPropertyView 
                  token={token} 
                  user_id={String(user.id)} 
                  onSuccess={() => {
                    refreshData();
                    setActiveTab("properties");
                  }} 
                  onCancel={() => setActiveTab("properties")}
                  toast={toast}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-amber-200">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Profile Incomplete</h3>
                  <p className="text-slate-500 text-center max-w-md mb-6">
                    You must complete your profile to 100% before you can upload properties.
                  </p>
                  <Button onClick={() => setActiveTab("settings")}>
                    Complete Profile Now
                  </Button>
                </div>
              )
            )}


            {activeTab === "finance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-raleway">Financial Overview</h2>
                  <p className="text-slate-500 text-sm">Track your earnings and payout history.</p>
                </div>
                <Card className="border-dashed border-2 py-12 text-center bg-transparent">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <CreditCard className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Financial tracking will be available soon.</p>
                    <p className="text-xs text-slate-400">We're finalizing your payout dashboard.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-raleway">
                      Profile Settings
                    </h2>
                    <p className="text-slate-500">
                      Manage your landlord credentials and professional
                      information.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-900">
                        {completionPercentage}% Complete
                      </p>
                      <div className="w-32 bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-primary shadow-lg shadow-primary/20"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-3">
                          <Users className="h-5 w-5 text-primary" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              className="bg-slate-50 border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number *</Label>
                            <Input
                              value={editFormData.phone || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  phone: e.target.value,
                                })
                              }
                              className="bg-slate-50 border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nationality *</Label>
                            <Input
                              value={editFormData.nationality || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  nationality: e.target.value,
                                })
                              }
                              placeholder="e.g. Nigerian"
                              className="bg-slate-50 border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Occupation *</Label>
                            <Input
                              value={editFormData.occupation || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  occupation: e.target.value,
                                })
                              }
                              className="bg-slate-50 border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>State of Origin *</Label>
                            <Input
                              value={editFormData.state_of_origin || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  state_of_origin: e.target.value,
                                })
                              }
                              className="bg-slate-50 border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>LGA of Origin *</Label>
                            <Input
                              value={editFormData.lga_of_origin || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  lga_of_origin: e.target.value,
                                })
                              }
                              className="bg-slate-50 border-none"
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
                              className="bg-slate-50 border-none resize-none"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-3">
                          <Building className="h-5 w-5 text-primary" />
                          Professional Details
                        </h3>
                        <div className="space-y-4">
                          <Label>Professional Designation *</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant={
                                editFormData.designation === "business"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={`h-20 flex flex-col gap-1 border-2 transition-all ${editFormData.designation === "business" ? "border-primary bg-primary/5" : "border-slate-100"}`}
                              onClick={() =>
                                setEditFormData({
                                  ...editFormData,
                                  designation: "business",
                                })
                              }
                            >
                              <LayoutDashboard className="h-6 w-6 text-black" />
                              <span className="text-black">Business Owner</span>
                            </Button>
                            <Button
                              variant={
                                editFormData.designation === "employee"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={`h-20 flex flex-col gap-1 border-2 transition-all ${editFormData.designation === "employee" ? "border-primary bg-primary/5" : "border-slate-100"}`}
                              onClick={() =>
                                setEditFormData({
                                  ...editFormData,
                                  designation: "employee",
                                })
                              }
                            >
                              <Users className="h-6 w-6" />
                              <span>Employee</span>
                            </Button>
                          </div>

                          {editFormData.designation === "business" && (
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                              <div className="space-y-2">
                                <Label>Business Name *</Label>
                                <Input
                                  value={editFormData.business_name || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      business_name: e.target.value,
                                    })
                                  }
                                  className="bg-slate-50 border-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>CAC Certificate *</Label>
                                {editFormData.cac_cert ? (
                                  <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in duration-300">
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-primary/10">
                                      <Paperclip className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <p className="text-xs font-bold text-slate-700 truncate">
                                        {editFormData.cac_cert.split("/").pop()}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        Uploaded Document
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        setEditFormData((prev: any) => ({
                                          ...prev,
                                          cac_cert: "",
                                        }))
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <input
                                      type="file"
                                      id="cac_cert_upload"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          await handleFileUpload(
                                            file,
                                            "cac_cert",
                                            false,
                                            (url: string) => {
                                              setEditFormData((prev: any) => ({
                                                ...prev,
                                                cac_cert: url,
                                              }));
                                            },
                                            false,
                                            "upload/single",
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor="cac_cert_upload"
                                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-4 h-12 bg-slate-50 hover:bg-slate-100 hover:border-primary/50 cursor-pointer transition-all group"
                                    >
                                      <div className="flex items-center gap-2">
                                        {uploadedFiles.find(
                                          (f: any) =>
                                            f.type === "cac_cert" &&
                                            f.uploading,
                                        ) ? (
                                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        ) : (
                                          <Upload className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        )}
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700">
                                          {uploadedFiles.find(
                                            (f: any) =>
                                              f.type === "cac_cert" &&
                                              f.uploading,
                                          )
                                            ? "Uploading..."
                                            : "Upload Certificate"}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                )}
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <Label>Business Address *</Label>
                                <Input
                                  value={editFormData.business_address || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      business_address: e.target.value,
                                    })
                                  }
                                  className="bg-slate-50 border-none"
                                />
                              </div>
                            </div>
                          )}

                          {editFormData.designation === "employee" && (
                            <div className="pt-4 animate-in fade-in duration-300">
                              <div className="space-y-2">
                                <Label>Place of Work *</Label>
                                <Input
                                  value={editFormData.place_of_work || ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      place_of_work: e.target.value,
                                    })
                                  }
                                  placeholder="Company name or organization"
                                  className="bg-slate-50 border-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          Payout Details
                        </h3>
                        <div className="space-y-4">
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
                              className="bg-slate-50 border-none"
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
                              className="bg-slate-50 border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bank Name *</Label>
                            <Input
                              value={editFormData.bank_name || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  bank_name: e.target.value,
                                })
                              }
                              className="bg-slate-50 border-none"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="p-6 bg-slate-900 rounded-2xl text-white">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Why this matters?
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Complete profile details help us verify your identity
                        and ensure smooth property management. 100% completion
                        is mandatory for uploading new listings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>


    </div>
  );
}
