import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";

interface Application {
  id: string;
  property_id: string;
  status: string;
  payment_plan_preference: string;
  created_at: string;
  properties?: {
    code_name: string;
    typology: string;
  };
  fullName?: string;
  email?: string;
  phone?: string;
}

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
  updateApplicationStatus: (id: string, status: string) => void;
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
  updateApplicationStatus,
}: ApplicationsTabProps) {
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      (app.properties?.code_name?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.fullName?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.email?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.phone?.toString() || "")
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
              placeholder="Search applications by property, applicant name, or email..."
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
                  <TableHead>Property</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Payment Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {app.properties?.code_name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {app.properties?.typology}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.fullName || "N/A"}</p>
                        <p className="text-xs text-gray-600">
                          ID: {(app.id?.toString() || "").substring(0, 8)}
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
                    <TableCell>{formatDate(app.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {app.payment_plan_preference === "ez_anchor"
                          ? "EZ-Anchor"
                          : "EZ-Ascend"}
                      </Badge>
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
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-semibold">
                                    Applicant
                                  </Label>
                                  <p>{app.fullName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold">
                                    Property
                                  </Label>
                                  <p>{app.properties?.code_name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold">
                                    Email
                                  </Label>
                                  <p>{app.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold">
                                    Phone
                                  </Label>
                                  <p>{app.phone}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Payment Plan Preference</Label>
                                <p className="font-medium">
                                  {app.payment_plan_preference === "ez_anchor"
                                    ? "EZ-Anchor (Pay monthly)"
                                    : "EZ-Ascend (Pay annually)"}
                                </p>
                              </div>
                              <div>
                                <Label>Update Status</Label>
                                <Select
                                  defaultValue={app.status}
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
        )}
      </CardContent>
    </Card>
  );
}
