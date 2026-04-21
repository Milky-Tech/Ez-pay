"use client";

import { useState } from "react";
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
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import {
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Mail,
  Phone,
  Shield,
  User,
  Trash2,
  Building2,
} from "lucide-react";

import { Landlord } from "@/app/types/property";
import { Office } from "@/app/admin/components/OfficesTab";

interface UsersTabProps {
  users: Landlord[];
  offices: Office[];
  loading: boolean;
  fetchUsers: () => void;
  formatDate: (dateString: string) => string;
  onRegisterAdmin: (data: any) => Promise<boolean>;
  onDeleteUser: (id: string, name: string) => void;
  currentUser: any;
}

export default function UsersTab({
  users,
  offices,
  loading,
  fetchUsers,
  formatDate,
  onRegisterAdmin,
  onDeleteUser,
  currentUser,
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminData, setAdminData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    office_id: "none",
    role: "admin",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRegisterAdmin = async () => {
    if (adminData.password !== adminData.password_confirmation) {
      alert("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    const payload: any = {
      full_name: adminData.full_name,
      email: adminData.email,
      password: adminData.password,
    };
    if (adminData.office_id && adminData.office_id !== "none") payload.office_id = Number(adminData.office_id);
    if (adminData.role) payload.role = adminData.role;

    const success = await onRegisterAdmin(payload);
    setIsSubmitting(false);
    if (success) {
      setIsAdminDialogOpen(false);
      setAdminData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        office_id: "none",
        role: "admin",
      });
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case "super_admin":
        return (
          <Badge className="bg-red-100 text-red-800 border-none">
            <Shield className="h-3 w-3 mr-1" /> Super Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-none">
            <Shield className="h-3 w-3 mr-1" /> Admin
          </Badge>
        );
      case "agent":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-none">
            Agent
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-green-100 text-green-800 border-none">
            Tenant
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 border-none">
            {role || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-raleway font-bold">User Management</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Manage and categorize all system users</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Create Administrator Account
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="admin-full_name">Full Name</Label>
                    <Input
                      id="admin-full_name"
                      placeholder="John Doe"
                      value={adminData.full_name}
                      onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@ez-pay.com"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-password_confirmation">Confirm Password</Label>
                    <Input
                      id="admin-password_confirmation"
                      type="password"
                      value={adminData.password_confirmation}
                      onChange={(e) =>
                        setAdminData({ ...adminData, password_confirmation: e.target.value })
                      }
                    />
                  </div>
                  {currentUser?.role === 'super_admin' && (
                    <div className="grid gap-2">
                      <Label htmlFor="admin-role">Admin Level</Label>
                      <Select
                        value={adminData.role || "admin"}
                        onValueChange={(v) => setAdminData({ ...adminData, role: v })}
                      >
                        <SelectTrigger id="admin-role" className="bg-white">
                          <Shield className="h-4 w-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Regular Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="admin-office">
                      Assign to Office{" "}
                      <span className="text-gray-400 text-xs font-normal">
                        {currentUser?.role === 'super_admin' ? "(optional)" : "(fixed)"}
                      </span>
                    </Label>
                    {currentUser?.role === 'super_admin' ? (
                      <Select
                        value={adminData.office_id}
                        onValueChange={(v) => setAdminData({ ...adminData, office_id: v })}
                      >
                        <SelectTrigger id="admin-office" className="bg-white">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="No office (super admin)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No office (super admin)</SelectItem>
                          {offices.map((office) => (
                            <SelectItem key={office.id} value={String(office.id)}>
                              {office.name} — {office.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-md text-sm text-gray-600">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {offices.find(o => o.id === currentUser?.office_id)?.name || "Your Assigned Office"}
                      </div>
                    )}
                    {offices.length === 0 && currentUser?.role === 'super_admin' && (
                      <p className="text-xs text-amber-600">
                        No offices registered yet. Create offices in the Offices tab first.
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleRegisterAdmin}
                    disabled={
                      isSubmitting ||
                      !adminData.email ||
                      !adminData.password ||
                      !adminData.full_name ||
                      adminData.password !== adminData.password_confirmation
                    }
                    className="w-full"
                  >
                    {isSubmitting ? "Creating..." : "Create Admin Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="agent">Agents</SelectItem>
              <SelectItem value="user">Tenants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold">User</TableHead>
                <TableHead className="font-bold">Contact Info</TableHead>
                <TableHead className="font-bold">Role</TableHead>
                <TableHead className="font-bold">Joined Date</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500 font-raleway">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.created_at ? formatDate(user.created_at) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-destructive"
                        onClick={() => onDeleteUser(user.id.toString(), user.full_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
