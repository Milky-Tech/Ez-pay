"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, RefreshCw, Eye, Video, Users, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Inspection {
  id: number | string;
  payment_reference: string;
  inspection_type: "physical" | "virtual";
  preferred_date: string;
  scheduled_date: string;
  scheduled_time: string;
  email: string;
  phone_number: string;
  status: string;
  amount: number;
  house_listing_id: number;
  created_at: string;
  property?: {
    code_name?: string;
    typology?: string;
    area?: string;
  };
  user?: {
    full_name?: string;
  };
}

interface InspectionsTabProps {
  token: string | null;
}

export default function InspectionsTab({ token }: InspectionsTabProps) {
  const { toast } = useToast();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/inspections`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInspections(data.data || data);
      } else {
        throw new Error("Failed to load inspections");
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inspections.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-raleway font-bold text-slate-900">
              Inspection Bookings
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Manage and track property inspection requests.
            </p>
          </div>
          <Button
            onClick={fetchInspections}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-white shadow-sm rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Client / Contact</TableHead>
                <TableHead className="font-bold text-slate-700">Property</TableHead>
                <TableHead className="font-bold text-slate-700">Schedule</TableHead>
                <TableHead className="font-bold text-slate-700">Type / Fee</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#9A2A2A]" />
                    <p className="text-sm text-slate-500 mt-2">Loading inspections...</p>
                  </TableCell>
                </TableRow>
              ) : inspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No inspections booked yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                inspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900">
                        {inspection.user?.full_name || inspection.email}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{inspection.phone_number}</p>
                    </TableCell>
                    <TableCell>
                      {inspection.property ? (
                        <>
                          <p className="font-medium text-sm text-slate-800">
                            {inspection.property.code_name || `Property #${inspection.house_listing_id}`}
                          </p>
                          <p className="text-xs text-slate-500">{inspection.property.area}</p>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">ID: {inspection.house_listing_id}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-slate-800">
                        {inspection.scheduled_date ? format(new Date(inspection.scheduled_date), "MMM d, yyyy") : "TBD"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inspection.scheduled_time || "TBD"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {inspection.inspection_type === "physical" ? (
                          <Users className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Video className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-sm capitalize">{inspection.inspection_type}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#9A2A2A] mt-1">
                        ₦{inspection.amount?.toLocaleString() || 0}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(inspection.status)}
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
