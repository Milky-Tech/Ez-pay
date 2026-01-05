"use client";

import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Plus,
  Users,
  Building,
  CreditCard,
  BarChart3,
  Bell,
  Search,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function LandlordDashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    } else if (!loading && user && user.role !== 'landlord' && user.role !== 'admin') {
      router.push("/profile"); // Redirect non-landlords/admins to tenant profile
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-raleway text-primary">
                EZ-Pay
              </span>
            </div>
          </Link>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Landlord Portal</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <Button 
            variant={activeTab === "dashboard" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant={activeTab === "properties" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("properties")}
          >
            <Building className="h-4 w-4" />
            My Properties
          </Button>
          <Button 
            variant={activeTab === "applicants" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("applicants")}
          >
            <Users className="h-4 w-4" />
            Applicants
          </Button>
          <Button 
            variant={activeTab === "finance" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 h-11"
            onClick={() => setActiveTab("finance")}
          >
            <BarChart3 className="h-4 w-4" />
            Finance
          </Button>
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
              <AvatarFallback>{user.full_name?.charAt(0) || user.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full flex items-center gap-2 justify-center">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-grow max-w-xl">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input placeholder="Search properties, applicants..." className="pl-10 h-9 bg-slate-50 border-none focus-visible:ring-primary/20" />
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-gray-500">
               <Bell className="h-5 w-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <Button className="bg-primary flex items-center gap-2 hidden sm:flex">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 overflow-y-auto flex-grow">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 font-raleway">Good day, {user.full_name?.split(' ')[0] || user.fullName?.split(' ')[0]}!</h1>
                  <p className="text-slate-500">Here's what's happening with your properties today.</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-sm font-medium text-primary">Portfolio Status:</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Healthy</Badge>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Properties", value: "3", icon: Building, color: "bg-blue-500" },
                { label: "Occupancy Rate", value: "85%", icon: Home, color: "bg-green-500" },
                { label: "Pending Applicants", value: "12", icon: Users, color: "bg-yellow-500" },
                { label: "Total Revenue", value: "₦1.2M", icon: CreditCard, color: "bg-purple-500" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                       <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                       </div>
                       <div className={`${stat.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                          <stat.icon className="h-5 w-5" />
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 font-raleway">Active Listings</h2>
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    Manage all <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, title: "Lekki Garden Estate", type: "Duplex", units: "4/5", status: "Active", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200" },
                    { id: 2, title: "Victoria Island Towers", type: "Apartment", units: "2/10", status: "Active", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=200" }
                  ].map((prop) => (
                    <Card key={prop.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={prop.img} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{prop.title}</h4>
                              <p className="text-sm text-slate-500">{prop.type} • {prop.units} Units Occupied</p>
                           </div>
                           <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-100 hidden sm:flex">{prop.status}</Badge>
                           <Button variant="ghost" size="icon">
                             <ChevronRight className="h-5 w-5 text-slate-400" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Secondary List */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 font-raleway">Recent Applicants</h2>
                <div className="space-y-4">
                   {[
                     { name: "Sarah John", prop: "Lekki Garden", date: "2h ago", avatar: "SJ" },
                     { name: "Michael Obi", prop: "VI Towers", date: "5h ago", avatar: "MO" },
                     { name: "David Kalu", prop: "Lekki Garden", date: "1d ago", avatar: "DK" }
                   ].map((user, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Avatar className="h-8 w-8 text-[10px] font-bold">
                           <AvatarFallback className="bg-slate-100 text-slate-600 border border-slate-200">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                           <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                           <p className="text-[10px] text-slate-500 uppercase tracking-tight">{user.prop}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{user.date}</p>
                     </div>
                   ))}
                   <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5">View Applicant Queue</Button>
                </div>

                <Card className="bg-primary text-white border-none shadow-lg overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <ClipboardCheck className="h-24 w-24" />
                   </div>
                   <CardContent className="p-6 relative z-10">
                      <h4 className="font-bold text-lg mb-2">Portfolio Analytics</h4>
                      <p className="text-sm text-primary-foreground opacity-90 mb-4">You have 5 pending reviews this week. Keep your response time low for better visibility.</p>
                      <Button variant="secondary" size="sm" className="w-full">Open Analytics</Button>
                   </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
