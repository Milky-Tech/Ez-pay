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
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Profile Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold font-raleway text-primary hidden sm:block">
                    EZ-Pay
                  </span>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
              <h1 className="text-lg font-semibold text-gray-900">Tenant Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/30"></div>
              <CardContent className="px-6 -mt-12 text-center pb-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md mx-auto mb-4">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback>{user.full_name?.charAt(0) || user.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900">{user.full_name || user.fullName}</h2>
                <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/20">
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
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Active Rentals</p>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Home className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">1</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">₦0.00</p>
                </CardContent>
              </Card>
            </div>

            {/* Content for Tabs */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
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
                              <h4 className="font-bold text-gray-900">Luxury Duplex in Lekki Phase 1</h4>
                              <p className="text-sm text-gray-500">Application submitted • Dec 28, 2025</p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 border-none">Pending Review</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/listings/lekki-duplex">View Property</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm p-8 text-center bg-white">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Home className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg">Looking for a new home?</h4>
                      <p className="text-sm text-gray-500">Explore premium listings and find the perfect place to stay with EZ-Pay.</p>
                      <Button className="w-full bg-primary" asChild>
                        <Link href="/listings">Browse Listings</Link>
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900">Your Rental Applications</h3>
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
                                 <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="" />
                               </div>
                               <div>
                                 <p className="font-bold text-sm">Lekki Phase 1 Duplex</p>
                                 <p className="text-xs text-gray-500">Lekki, Lagos</p>
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-600">Dec 28, 2025</td>
                           <td className="px-6 py-4">
                             <Badge className="bg-yellow-100 text-yellow-800 border-none">Pending</Badge>
                           </td>
                           <td className="px-6 py-4">
                             <Button variant="ghost" size="sm" className="text-primary p-0">View Details</Button>
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
                <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                <Card className="border-none shadow-sm p-12 text-center bg-white">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-bold">No payments yet</h4>
                    <p className="text-sm text-gray-500">Once you have an active rental, your payment history will appear here.</p>
                  </div>
                </Card>
              </div>
            )}
            
            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription>Update your contact details and profile preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-900">{user.full_name || user.fullName}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Email Address</label>
                          <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-900">{user.email}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Phone Number</label>
                          <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-900">{user.phone || "Not provided"}</div>
                        </div>
                     </div>
                     <div className="pt-4 flex justify-end">
                       <Button className="bg-primary">Save Changes</Button>
                     </div>
                  </CardContent>
                </Card>
                
                <Card className="border-none shadow-sm bg-white border-red-100">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
