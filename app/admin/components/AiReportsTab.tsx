"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, RefreshCw, Brain, AlertCircle, CheckCircle, Search, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/app/components/ui/input";

interface AiReport {
  unique_id: string;
  property_address: string;
  ai_overall_score: number;
  ai_status: string;
  ai_confidence: number;
  ai_category_scores: Record<string, number>;
  ai_detected_objects: Record<string, boolean>;
  ai_ocr_text: string;
  ai_flags: any[];
  ai_recommendations: string[];
  ai_consistency_report: any;
  ai_analyzed_at: string;
}

export default function AiReportsTab({ token }: { token: string | null }) {
  const [reports, setReports] = useState<AiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-reports`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch AI reports" });
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async (id: string) => {
    try {
      setRefreshing(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-reports/${id}/reanalyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        toast({ title: "Analysis Triggered", description: "The property analysis has been restarted." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to trigger re-analysis" });
    } finally {
      setRefreshing(null);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed": return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">PASSED</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-800 border-red-200">FAILED</Badge>;
      case "needs_review": return <Badge className="bg-amber-100 text-amber-800 border-amber-200">REVIEW</Badge>;
      default: return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const filteredReports = reports.filter(r => 
    r.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unique_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#9A2A2A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-raleway text-slate-900">AI Inspection Intelligence</h2>
          <p className="text-sm text-slate-500">Automated ACCESS Standard validation and consistency audit.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search ID or Address..." 
                    className="pl-9 h-10 w-[250px] rounded-xl border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={fetchReports} variant="outline" className="rounded-xl border-slate-200">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.unique_id} className="border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${report.ai_overall_score >= 80 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <span className={`text-xl font-black ${report.ai_overall_score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {report.ai_overall_score}%
                        </span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 truncate max-w-[300px]">{report.property_address}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {report.unique_id}</span>
                            {getStatusBadge(report.ai_status)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow max-w-xl">
                    {Object.entries(report.ai_category_scores || {}).map(([key, val]) => (
                        <div key={key} className="text-center p-2 bg-slate-50 rounded-xl">
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{key.replace('_', ' ')}</p>
                            <p className="text-xs font-black text-slate-700">{val}%</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => handleReanalyze(report.unique_id)}
                        disabled={refreshing === report.unique_id}
                        variant="secondary"
                        size="sm"
                        className="rounded-xl font-bold gap-2"
                    >
                        {refreshing === report.unique_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        Re-Analyze
                    </Button>
                </div>
              </div>

              <div className="px-6 pb-6 border-t border-slate-50 pt-4 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" /> Critical Flags & Recoms
                        </h5>
                        <div className="space-y-2">
                            {report.ai_flags?.map((f, i) => (
                                <div key={i} className="text-xs p-2 rounded-lg bg-red-50 text-red-700 border border-red-100 flex items-start gap-2">
                                    <span className="font-black mt-0.5">!</span>
                                    {f.description}
                                </div>
                            ))}
                            {report.ai_recommendations?.map((r, i) => (
                                <div key={i} className="text-xs p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                    • {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" /> Consistency Audit
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">OCR Match</p>
                                <p className={`text-xs font-bold mt-1 ${report.ai_consistency_report?.ocr_match?.includes('Warning') ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {report.ai_consistency_report?.ocr_match || 'Passed'}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Detail Match</p>
                                <p className={`text-xs font-bold mt-1 ${report.ai_consistency_report?.detail_match?.includes('Warning') ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {report.ai_consistency_report?.detail_match || 'Passed'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase">Extracted OCR Context</p>
                             <div className="mt-1 h-12 overflow-y-auto text-[10px] text-slate-500 italic">
                                {report.ai_ocr_text || "No OCR text extracted."}
                             </div>
                        </div>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
