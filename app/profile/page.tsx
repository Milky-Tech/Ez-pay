"use client";

import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Settings,
  LogOut,
  Home,
  CreditCard,
  ClipboardList,
  Bell,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleUpdateProfile = async (data: any) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action is permanent.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete account");

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      logout();
      router.push("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error deleting your account.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#9A2A2A] rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-black text-white font-raleway tracking-wider">EZ-PAY</span>
            <span className="text-[9px] text-[#C9A227] font-bold uppercase tracking-[0.15em] hidden sm:inline">Tenant</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/10 h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar Info — hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/30"></div>
              <CardContent className="px-6 -mt-12 text-center pb-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md mx-auto mb-4">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  />
                  <AvatarFallback>
                    {user.full_name?.charAt(0) || user.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.full_name || user.fullName}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                <Badge
                  variant="secondary"
                  className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/20"
                >
                  {user.role?.toUpperCase() || "TENANT"}
                </Badge>
              </CardContent>
              <div className="px-6 py-4 border-t bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>Verified Account</span>
                </div>
              </div>
            </Card>

            <div className="space-y-1">
              <Button
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-11"
                onClick={() => setActiveTab("overview")}
              >
                <Home className="h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === "applications" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-11"
                onClick={() => setActiveTab("applications")}
              >
                <ClipboardList className="h-4 w-4" />
                Applications
              </Button>
              <Button
                variant={activeTab === "payments" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-11"
                onClick={() => setActiveTab("payments")}
              >
                <CreditCard className="h-4 w-4" />
                Payments
              </Button>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-11"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 lg:hidden"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>


          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-5">

            {/* Mobile user info strip */}
            <div className="flex items-center gap-3 lg:hidden">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                <AvatarFallback>{user.full_name?.charAt(0) || user.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{user.full_name || user.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Badge className="ml-auto shrink-0 bg-[#9A2A2A]/10 text-[#9A2A2A] border-[#9A2A2A]/20 text-[10px]">
                {user.role?.toUpperCase() || "TENANT"}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Rentals</p>
                    <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                      <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">0</p>
                </CardContent>
              </Card>
              <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applications</p>
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                      <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">1</p>
                </CardContent>
              </Card>
              <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Spent</p>
                    <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                      <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">₦0</p>
                </CardContent>
              </Card>
            </div>

            {/* Content for Tabs */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent Activity
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                  >
                    View all
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Mock Activity Item */}
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=200"
                            alt="Property"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-bold text-gray-900">
                                Luxury Duplex in Lekki Phase 1
                              </h4>
                              <p className="text-sm text-gray-500">
                                Application submitted • Dec 28, 2025
                              </p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 border-none">
                              Pending Review
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/listings/lekki-duplex">
                            View Property
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm p-8 text-center bg-white">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Home className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg">
                        Looking for a new home?
                      </h4>
                      <p className="text-sm text-gray-500">
                        Explore premium listings and find the perfect place to
                        stay with EZ-Pay.
                      </p>
                      <Link href="/listings">
                        <Button className="w-full bg-primary" asChild>
                          Browse Listings
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900">
                  Your Rental Applications
                </h3>
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-6 py-4">Property</th>
                          <th className="px-6 py-4">Date Submitted</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=100"
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              </div>
                              <div>
                                <p className="font-bold text-sm">
                                  Lekki Phase 1 Duplex
                                </p>
                                <p className="text-xs text-gray-500">
                                  Lekki, Lagos
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            Dec 28, 2025
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-yellow-100 text-yellow-800 border-none">
                              Pending
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary p-0"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900">
                  Payment History
                </h3>
                <Card className="border-none shadow-sm p-12 text-center bg-white">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-bold">No payments yet</h4>
                    <p className="text-sm text-gray-500">
                      Once you have an active rental, your payment history will
                      appear here.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900">
                  Account Settings
                </h3>
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your contact details and profile preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdateProfile({
                          full_name: formData.get("full_name"),
                          phone: formData.get("phone"),
                        });
                      }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <Input
                            name="full_name"
                            defaultValue={user.full_name || user.fullName}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <Input
                            value={user.email}
                            disabled
                            className="bg-gray-50 cursor-not-allowed"
                          />
                          <p className="text-[10px] text-gray-400">
                            Email cannot be changed
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <Input
                            name="phone"
                            defaultValue={user.phone || ""}
                            placeholder="080 0000 0000"
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button
                          type="submit"
                          className="bg-primary"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-red-100">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteAccount()}
                    >
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a] border-t border-white/10">
        <div className="flex items-stretch h-16">
          {[
            { id: "overview", label: "Home", icon: Home },
            { id: "applications", label: "Applications", icon: ClipboardList },
            { id: "payments", label: "Payments", icon: CreditCard },
            { id: "settings", label: "Profile", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? "text-[#f1d57c]" : "text-white/40 hover:text-white/70"
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? "bg-[#9A2A2A]/30" : ""}`}>
                  <Icon className="h-5 w-5" />
                  {isActive && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#9A2A2A] rounded-full" />}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
