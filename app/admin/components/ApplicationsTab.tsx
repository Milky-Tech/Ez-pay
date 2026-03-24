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
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  FileText,
  User,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Application } from "@/app/types/property";

interface ApplicationsTabProps {
  applications: Application[];
  loading: {
    applications: boolean;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (dateString: string) => string;
  fetchApplications: () => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string, comment?: string) => void;
}

export default function ApplicationsTab({
  applications,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  getStatusBadge,
  formatDate,
  fetchApplications,
  approveApplication,
  rejectApplication,
}: ApplicationsTabProps) {
  const [rejectionDialog, setRejectionDialog] = useState<{
    open: boolean;
    applicationId: string | null;
  }>({
    open: false,
    applicationId: null,
  });
  const [rejectionComment, setRejectionComment] = useState("");

  const handleConfirmReject = () => {
    if (rejectionDialog.applicationId) {
      rejectApplication(rejectionDialog.applicationId, rejectionComment);
      setRejectionDialog({ open: false, applicationId: null });
      setRejectionComment("");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      (app.properties?.code_name?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.full_name?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.email?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.phone?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.unique_id?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="font-raleway">Rental Applications</CardTitle>
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
              placeholder="Search applications by ID, applicant name, or email..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="vetting_pending">Vetting Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading.applications ? (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-4">Loading applications...</p>
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
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Package & Plan</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.full_name || "N/A"}</p>
                        <p className="text-xs text-gray-600 font-mono">
                          ID: {app.id}
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
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="capitalize">
                          {app.tenant_package || "N/A"}
                        </Badge>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">
                          {app.payment_plan || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(app.created_at)}</p>
                      <p className="text-xs text-gray-500">
                        Listing: {app.listing_id.substring(0, 8)}...
                      </p>
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
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold">
                                Tenant Application Review - {app.id}
                              </DialogTitle>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                              {/* Left Column: Personal & Landlord Info */}
                              <div className="space-y-6">
                                <section>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <User className="h-5 w-5" /> Personal
                                    Details
                                  </h3>
                                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        Full Name
                                      </Label>
                                      <p className="font-medium">
                                        {app.full_name}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Email
                                        </Label>
                                        <p className="text-sm">{app.email}</p>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Phone
                                        </Label>
                                        <p className="text-sm">{app.phone}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        Current Address
                                      </Label>
                                      <p className="text-sm">
                                        {app.current_address}
                                      </p>
                                    </div>
                                  </div>
                                </section>

                                <section>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <MapPin className="h-5 w-5" /> Current
                                    Landlord Info
                                  </h3>
                                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Landlord Name
                                        </Label>
                                        <p className="text-sm">
                                          {app.current_landlord_name}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Contact
                                        </Label>
                                        <p className="text-sm">
                                          {app.current_landlord_contact}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        Duration of Stay
                                      </Label>
                                      <p className="text-sm">
                                        {app.duration_of_stay}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        Reason for leaving
                                      </Label>
                                      <p className="text-sm italic">
                                        {app.reason_for_leaving}
                                      </p>
                                    </div>
                                  </div>
                                </section>

                                <section>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <AlertCircle className="h-5 w-5" />{" "}
                                    Emergency Contact
                                  </h3>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Name
                                        </Label>
                                        <p className="text-sm">
                                          {app.emergency_contact_name}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Phone
                                        </Label>
                                        <p className="text-sm">
                                          {app.emergency_contact_phone}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </section>
                              </div>

                              {/* Right Column: Employment & Documents */}
                              <div className="space-y-6">
                                <section>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <Briefcase className="h-5 w-5" /> Employment
                                    Info
                                  </h3>
                                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        Company Name
                                      </Label>
                                      <p className="text-sm font-medium">
                                        {app.company_name}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Job Title
                                        </Label>
                                        <p className="text-sm">
                                          {app.job_title}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Monthly Income
                                        </Label>
                                        <p className="text-sm font-semibold text-green-700">
                                          ₦{app.monthly_income.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        HR Contact
                                      </Label>
                                      <p className="text-sm">
                                        {app.hr_contact}
                                      </p>
                                    </div>
                                  </div>
                                </section>

                                <section>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <FileText className="h-5 w-5" /> Application
                                    Details
                                  </h3>
                                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Package
                                        </Label>
                                        <Badge
                                          variant="outline"
                                          className="capitalize"
                                        >
                                          {app.tenant_package}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-gray-500">
                                          Payment Plan
                                        </Label>
                                        <Badge className="bg-blue-100 text-blue-800 border-none capitalize">
                                          {app.payment_plan}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">
                                        Desired Start Date
                                      </Label>
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {formatDate(app.desired_start_date)}
                                      </div>
                                    </div>
                                  </div>
                                </section>

                                <section>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                                    <LinkIcon className="h-5 w-5" />{" "}
                                    Verification Documents
                                  </h3>
                                  <div className="grid grid-cols-1 gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="justify-start"
                                      asChild
                                    >
                                      <a
                                        href={app.bank_statement_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />{" "}
                                        Bank Statement
                                      </a>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="justify-start"
                                      asChild
                                    >
                                      <a
                                        href={app.government_id_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />{" "}
                                        Government ID
                                      </a>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="justify-start"
                                      asChild
                                    >
                                      <a
                                        href={app.live_photo_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />{" "}
                                        Live Photo/Selfie
                                      </a>
                                    </Button>
                                    {app.verification_video_path && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="justify-start"
                                        asChild
                                      >
                                        <a
                                          href={app.verification_video_path}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <FileText className="h-4 w-4 mr-2" />{" "}
                                          Verification Video
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </section>
                              </div>
                            </div>

                            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Label>Current Status:</Label>
                                {getStatusBadge(app.status)}
                              </div>

                              {app.status === "pending" ||
                              app.status === "submitted" ||
                              app.status === "vetting_pending" ? (
                                <div className="flex gap-3">
                                  <Button
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                                    onClick={() =>
                                      approveApplication(app.unique_id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="min-w-[120px]"
                                    onClick={() =>
                                      setRejectionDialog({
                                        open: true,
                                        applicationId: app.unique_id,
                                      })
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">
                                  This application has already been processed (
                                  {app.status}).
                                </p>
                              )}
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

      <Dialog
        open={rejectionDialog.open}
        onOpenChange={(open) =>
          setRejectionDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">
                Please provide a reason for rejecting this application. This
                will be shared with the applicant.
              </Label>
              <Textarea
                id="comment"
                placeholder="e.g. Incomplete documents, insufficient income, etc."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setRejectionDialog({ open: false, applicationId: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionComment.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
