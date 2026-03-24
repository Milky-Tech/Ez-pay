"use client";

import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { RentalApplication } from "@/lib/types";

interface ApplicationItemProps {
  application: RentalApplication & { applicant_name?: string; property?: any };
  onClick: (id: string) => void;
}

export const ApplicationItem = ({
  application,
  onClick,
}: ApplicationItemProps) => {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-primary/20 transition-colors cursor-pointer"
      onClick={() => onClick(application.id)}
    >
      <Avatar className="h-8 w-8 text-[10px] font-bold">
        <AvatarFallback className="bg-slate-100 text-slate-600 border border-slate-200">
          {application.applicant_name?.charAt(0) || "A"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">
          {application.applicant_name}
        </p>
        <p className="text-[10px] text-slate-500 uppercase tracking-tight">
          {application.property?.typology || "Property"}
        </p>
        <p className="text-[10px] text-slate-400">
          {application.payment_plan_preference}
        </p>
      </div>
      <Badge
        className={`text-xs ${
          application.status === "approved"
            ? "bg-green-50 text-green-700"
            : application.status === "rejected"
            ? "bg-red-50 text-red-700"
            : "bg-yellow-50 text-yellow-700"
        }`}
      >
        {application.status}
      </Badge>
    </div>
  );
};
