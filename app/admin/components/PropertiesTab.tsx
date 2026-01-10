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
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PropertyReviewDialog from "./PropertyReviewDialog";

interface Property {
  id: string;
  code_name: string;
  email: string;
  phone: string;
  typology: string;
  area: string;
  state: string;
  monthly_cost: number | null;
  availability_status: string;
  status?: string;
  fullName: string;
  property_address: string;
  noOfUnits: number;
  rent: number;
  compound_road?: string;
  power_system?: string;
  interior_rooms?: string;
  exterior_shot?: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertiesTabProps {
  properties: Property[];
  loading: {
    properties: boolean;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatPrice: (price: number | null) => string;
  fetchProperties: () => void;
  openApprovalDialog: (property: Property) => void;
  rejectProperty: (propertyId: string) => void;
}

export default function PropertiesTab({
  properties,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  getStatusBadge,
  formatPrice,
  fetchProperties,
  openApprovalDialog,
  rejectProperty,
}: PropertiesTabProps) {
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      (property.id?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (property.fullName?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (property.area?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (property.state?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && property.status === "approved") ||
      (statusFilter === "pending" && property.status === "pending") ||
      (statusFilter === "in_review" && property.status === "in_review");

    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="font-raleway">Property Submissions</CardTitle>
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchProperties}
              variant="outline"
              size="sm"
              disabled={loading.properties}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  loading.properties ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties by name, code, or location..."
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
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading.properties ? (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-4">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">
              {searchTerm || statusFilter !== "all"
                ? "No submissions match your search criteria"
                : "No property submissions found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Submission Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property: Property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      {property.id?.toString() || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.typology}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {property.area}, {property.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">
                        {property.fullName}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₦
                      {property.rent
                        ? Math.round(
                            (property.rent * 1.1) / 12
                          ).toLocaleString()
                        : formatPrice(property.monthly_cost)}
                    </TableCell>
                    <TableCell>{property.noOfUnits}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        Pending Review
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        Calculate on Review
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(property.status || "pending")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {property.status === "approved" ? (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Review Property Submission #{property.id}
                                  </DialogTitle>
                                </DialogHeader>
                                <PropertyReviewDialog
                                  property={property}
                                  onApprove={() => openApprovalDialog(property)}
                                  onReject={() => rejectProperty(property.id)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button variant="default" size="sm">
                              View Listing
                            </Button>
                          </>
                        ) : (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Review Property Submission #{property.id}
                                  </DialogTitle>
                                </DialogHeader>
                                <PropertyReviewDialog
                                  property={property}
                                  onApprove={() => openApprovalDialog(property)}
                                  onReject={() => rejectProperty(property.id)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openApprovalDialog(property)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectProperty(property.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
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
