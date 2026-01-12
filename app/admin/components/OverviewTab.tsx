import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  CheckCircle,
  FileText,
  UserCheck,
  RefreshCw,
  AlertCircle,
  MapPin,
  User,
  Calendar,
} from "lucide-react";

interface OverviewTabProps {
  stats: {
    totalProperties: number;
    availableProperties: number;
    totalApplications: number;
    pendingApplications: number;
    activeLandlords: number;
    totalLandlords: number;
  };
  properties: any[];
  applications: any[];
  loading: {
    properties: boolean;
    applications: boolean;
  };
  getStatusBadge: (status: string) => JSX.Element;
  formatPrice: (price: number | null) => string;
  formatDate: (dateString: string) => string;
  fetchProperties: () => void;
  fetchApplications: () => void;
}

export default function OverviewTab({
  stats,
  properties,
  applications,
  loading,
  getStatusBadge,
  formatPrice,
  formatDate,
  fetchProperties,
  fetchApplications,
}: OverviewTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Properties Application
            </CardTitle>
            <Home className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.totalProperties}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.availableProperties} approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {stats.availableProperties}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tenant Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.totalApplications}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingApplications} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Landlords
            </CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.activeLandlords}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              out of {stats.totalLandlords} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-raleway">Recent Properties</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchProperties}
                disabled={loading.properties}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading.properties ? (
              <div className="text-center py-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  Loading properties...
                </p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-2">No properties found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {property.id || "Pending Code"}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.area}, {property.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Owner: {property.full_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(property.availability_status)}
                      <p className="text-xs font-semibold text-primary">
                        ₦
                        {property.rent
                          ? Math.round(
                              (property.rent * 1.1) / 12
                            ).toLocaleString()
                          : formatPrice(property.monthly_cost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-raleway">
                Recent Applications
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchApplications}
                disabled={loading.applications}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading.applications ? (
              <div className="text-center py-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  Loading applications...
                </p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-2">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {app.properties?.id || "Property"}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {app.fullName || "Applicant"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(app.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(app.status)}
                      <Badge variant="outline" className="text-xs">
                        {app.payment_plan_preference === "ez_anchor"
                          ? "EZ-Anchor"
                          : "EZ-Ascend"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
