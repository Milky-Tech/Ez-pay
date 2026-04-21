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
import { Label } from "@/app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import {
  Building2,
  MapPin,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NIGERIAN_STATES_LGAS } from "@/lib/nigerian-states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

export interface Office {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  state: string;
  created_at: string;
}

interface OfficesTabProps {
  offices: Office[];
  loading: boolean;
  fetchOffices: () => void;
  token: string | null;
  formatDate: (dateString: string) => string;
}

const emptyForm = { name: "", address: "", latitude: "", longitude: "", state: "" };

function OfficeFormFields({ form, setForm }: { form: typeof emptyForm, setForm: (val: typeof emptyForm) => void }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="office-name">Office Name</Label>
        <Input
          id="office-name"
          placeholder="Lagos Branch"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="office-address">Address</Label>
        <Input
          id="office-address"
          placeholder="14 Bourdillon Rd, Ikoyi"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="office-lat">Latitude</Label>
          <Input
            id="office-lat"
            type="number"
            step="any"
            placeholder="6.4281"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="office-lng">Longitude</Label>
          <Input
            id="office-lng"
            type="number"
            step="any"
            placeholder="3.4219"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="office-state">State</Label>
        <Select
          value={form.state}
          onValueChange={(val) => setForm({ ...form, state: val })}
        >
          <SelectTrigger id="office-state">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(NIGERIAN_STATES_LGAS).map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function OfficesTab({
  offices,
  loading,
  fetchOffices,
  token,
  formatDate,
}: OfficesTabProps) {
  const { toast } = useToast();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenEdit = (office: Office) => {
    setEditingOffice(office);
    setForm({
      name: office.name,
      address: office.address,
      latitude: String(office.latitude),
      longitude: String(office.longitude),
      state: office.state || "",
    });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/offices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          state: form.state,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create office");
      toast({ title: "Office Created", description: `${form.name} has been registered.` });
      setIsCreateOpen(false);
      setForm(emptyForm);
      fetchOffices();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingOffice) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/offices/${editingOffice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          state: form.state,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update office");
      toast({ title: "Office Updated", description: `${form.name} has been updated.` });
      setIsEditOpen(false);
      setEditingOffice(null);
      fetchOffices();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (office: Office) => {
    if (!confirm(`Delete office "${office.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/offices/${office.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      toast({ title: "Deleted", description: `${office.name} removed.` });
      fetchOffices();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-raleway font-bold">Branch Offices</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Manage physical EZ-PAY branch office locations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchOffices}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {/* Create Office Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Office
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Register Branch Office
                  </DialogTitle>
                </DialogHeader>
                <OfficeFormFields form={form} setForm={setForm} />
                <DialogFooter>
                  <Button
                    onClick={handleCreate}
                    disabled={submitting || !form.name || !form.address || !form.latitude || !form.longitude || !form.state}
                    className="w-full"
                  >
                    {submitting ? "Creating..." : "Create Office"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{offices.length}</p>
            <p className="text-sm text-gray-500">Total Offices</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{offices.length}</p>
            <p className="text-sm text-gray-500">Active Locations</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">\u2014</p>
            <p className="text-sm text-gray-500">Assigned Admins</p>
          </div>
        </div>
      </div>

      <CardContent className="px-0">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold">Office</TableHead>
                <TableHead className="font-bold">Address</TableHead>
                <TableHead className="font-bold">State</TableHead>
                <TableHead className="font-bold">Coordinates</TableHead>
                <TableHead className="font-bold">Registered</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-gray-500 mt-2">Loading offices...</p>
                  </TableCell>
                </TableRow>
              ) : offices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Building2 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No branch offices registered yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click \"Add Office\" to register the first one.</p>
                  </TableCell>
                </TableRow>
              ) : (
                offices.map((office) => (
                  <TableRow key={office.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{office.name}</p>
                          <p className="text-xs text-gray-400">ID: {office.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{office.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{office.state || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-mono">
                      {Number(office.latitude).toFixed(6)}, {Number(office.longitude).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {office.created_at ? formatDate(office.created_at) : "\u2014"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-primary"
                          onClick={() => handleOpenEdit(office)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-destructive"
                          onClick={() => handleDelete(office)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Office Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Office
            </DialogTitle>
          </DialogHeader>
          <OfficeFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              onClick={handleUpdate}
              disabled={submitting || !form.name || !form.address || !form.state}
              className="w-full"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
