"use client";

import React, { useMemo } from "react";
import { 
  BarChart3, 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  Receipt, 
  Info, 
  MapPin, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Wallet,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

interface FinanceTabProps {
  properties: any[];
}

const FinanceTab: React.FC<FinanceTabProps> = ({ properties }) => {
  const router = useRouter();

  const financialStats = useMemo(() => {
    // Separate Live vs Pending Upgrade
    const liveProperties = properties.filter(
      (p) => p.status === "approved" && p.listing_status !== "upgrade_pending" && p.listing_status !== "pending_upgrade"
    );

    const pendingUpgradeProperties = properties.filter(
      (p) => p.listing_status === "upgrade_pending" || p.listing_status === "pending_upgrade"
    );

    const processProperties = (props: any[]) => {
      return props.map((p) => {
        const annualRent = Number(p.rent) || 0;
        const monthlyGross = annualRent / 12;
        
        const paybackAmount = Number(p.payback_amount) || 0;
        const loanAmount = Number(p.upgrade_loan) || 0;
        const period = Number(p.amortization_period) || 1; // months
        
        const monthlyAmortization = paybackAmount > 0 && period > 0 ? (paybackAmount / period) : 0;
        const netPayout = monthlyGross - monthlyAmortization;
        
        // Amortization Rate %: How much of the monthly rent goes to payback
        const amortizationRate = monthlyGross > 0 ? (monthlyAmortization / monthlyGross) * 100 : 0;

        return {
          ...p,
          monthlyGross,
          monthlyAmortization,
          netPayout,
          amortizationRate,
          loanAmount,
          paybackAmount,
          period
        };
      });
    };

    const liveBreakdown = processProperties(liveProperties);
    const pendingBreakdown = processProperties(pendingUpgradeProperties);

    const totals = {
      totalGross: liveBreakdown.reduce((acc, curr) => acc + curr.monthlyGross, 0),
      totalAmortization: liveBreakdown.reduce((acc, curr) => acc + curr.monthlyAmortization, 0),
      totalNet: liveBreakdown.reduce((acc, curr) => acc + curr.netPayout, 0),
      totalLoans: properties.reduce((acc, curr) => acc + (Number(curr.upgrade_loan) || 0), 0),
      totalPayback: properties.reduce((acc, curr) => acc + (Number(curr.payback_amount) || 0), 0),
    };

    return { totals, liveBreakdown, pendingBreakdown };
  }, [properties]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-raleway tracking-tight">Financial Treasury</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time performance metrics and asset liquidity.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/50">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Optimized Returns</span>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-2xl bg-[#0a0a0a] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="h-20 w-20" />
          </div>
          <CardContent className="p-6">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Capital Loans</p>
            <h3 className="text-2xl font-black font-raleway">{formatCurrency(financialStats.totals.totalLoans)}</h3>
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-[#C9A227] text-black border-none text-[8px] font-bold">ACTIVE DEBT</Badge>
              <span className="text-white/30 text-[9px]">Across {properties.filter(p => p.upgrade_loan).length} assets</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden relative group border-b-4 border-[#9A2A2A]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <ArrowUpRight className="h-20 w-20 text-[#9A2A2A]" />
          </div>
          <CardContent className="p-6">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Monthly Gross Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 font-raleway">{formatCurrency(financialStats.totals.totalGross)}</h3>
            <div className="mt-4 flex items-center gap-2 text-slate-400">
              <Building2 className="h-3 w-3" />
              <span className="text-[9px] font-bold">LIFETIME YIELD TRACKING</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden relative group border-b-4 border-red-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <ArrowDownRight className="h-20 w-20 text-red-500" />
          </div>
          <CardContent className="p-6">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Monthly Repayments</p>
            <h3 className="text-2xl font-black text-red-600 font-raleway">{formatCurrency(financialStats.totals.totalAmortization)}</h3>
            <div className="mt-4 flex items-center gap-2 text-slate-400">
              <Receipt className="h-3 w-3" />
              <span className="text-[9px] font-bold">AUTOMATED DEDUCTIONS</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-emerald-600 text-white overflow-hidden relative group shadow-emerald-200">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <PiggyBank className="h-20 w-20" />
          </div>
          <CardContent className="p-6">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Net Monthly Payout</p>
            <h3 className="text-2xl font-black font-raleway">{formatCurrency(financialStats.totals.totalNet)}</h3>
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-none text-[8px] font-bold">READY FOR SETTLEMENT</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Portfolio */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 font-raleway flex items-center gap-3">
            <div className="h-8 w-1.5 bg-[#9A2A2A] rounded-full" />
            Live Revenue Portfolio
            <Badge variant="outline" className="text-[10px] font-black uppercase ml-2">{financialStats.liveBreakdown.length} ASSETS</Badge>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {financialStats.liveBreakdown.length === 0 ? (
            <Card className="border-dashed border-2 py-16 text-center bg-transparent">
              <CardContent className="space-y-4 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 opacity-20" />
                </div>
                <p className="font-medium">No live assets found in your portfolio.</p>
                <Button variant="outline" size="sm" onClick={() => router.push('/landlord?tab=properties')}>Add Property</Button>
              </CardContent>
            </Card>
          ) : (
            financialStats.liveBreakdown.map((item) => (
              <PropertyFinanceCard key={item.id} item={item} formatCurrency={formatCurrency} router={router} />
            ))
          )}
        </div>
      </div>

      {/* Upgrade Pipeline */}
      {financialStats.pendingBreakdown.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 font-raleway flex items-center gap-3">
              <div className="h-8 w-1.5 bg-[#C9A227] rounded-full" />
              Upgrade Pipeline
              <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-black uppercase ml-2">PROJECTION</Badge>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {financialStats.pendingBreakdown.map((item) => (
              <PropertyFinanceCard key={item.id} item={item} isPending formatCurrency={formatCurrency} router={router} />
            ))}
          </div>
        </div>
      )}

      {/* Payout Guide */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-lg font-black text-blue-900 mb-2 font-raleway">Financial Calculation Integrity</h4>
          <p className="text-sm text-blue-700/80 leading-relaxed max-w-3xl">
            Your monthly payout is automatically reconciled using the formula: <code className="bg-blue-100 px-2 py-0.5 rounded font-bold text-blue-900">(Annual Rent / 12) - (Total Payback / Amortization Period)</code>. 
            All deductions are transparently managed to ensure your asset liquidity is maintained at optimal levels.
          </p>
        </div>
      </div>
    </div>
  );
};

const PropertyFinanceCard = ({ item, isPending = false, formatCurrency, router }: { item: any, isPending?: boolean, formatCurrency: any, router: any }) => {
  return (
    <Card className={`border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white group ${isPending ? 'opacity-90' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Property Branding */}
          <div className={`p-8 lg:w-[35%] flex flex-col justify-between relative overflow-hidden ${isPending ? 'bg-amber-50/50' : 'bg-slate-50/50'}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-[#9A2A2A] uppercase tracking-[0.2em]">{item.typology}</span>
                {isPending && <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0">UPGRADE PENDING</Badge>}
              </div>
              <h4 className="text-2xl font-black text-slate-900 font-raleway leading-tight mb-2 group-hover:text-[#9A2A2A] transition-colors">
                {item.code_name || `${item.typology} in ${item.area || item.state || 'Asset'}`}
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin className="h-3 w-3 text-slate-400" /> {item.property_address}
              </p>
            </div>

            <div className="mt-8 relative z-10 flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-9 px-4 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                onClick={() => router.push(item.status === "approved" ? `/listings/${item.id}` : `/landlord/listings/${item.id}/preview`)}
              >
                Asset Details
              </Button>
              {!isPending && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase">Live Yield</span>
                </div>
              )}
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-6 -left-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
              <Building2 className="h-32 w-32" />
            </div>
          </div>

          {/* Right: Financial Grid */}
          <div className="flex-1 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 items-center bg-white">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Receipt className="h-3 w-3" /> Annual Rent
              </p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(Number(item.rent || 0))}</p>
              <p className="text-[10px] text-slate-400 font-medium">₦{(Number(item.rent || 0) / 12).toLocaleString()} / month</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Total Loan
              </p>
              <p className="text-lg font-bold text-slate-800">{item.loanAmount > 0 ? formatCurrency(item.loanAmount) : "—"}</p>
              {item.paybackAmount > 0 && (
                <p className="text-[10px] text-[#C9A227] font-bold">Payback: {formatCurrency(item.paybackAmount)}</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-3 w-3" /> Amortization
              </p>
              {item.monthlyAmortization > 0 ? (
                <>
                  <p className="text-lg font-bold text-red-500">-{formatCurrency(item.monthlyAmortization)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">{item.period} Months</span>
                    <Badge className="bg-red-50 text-red-600 border-none text-[8px] font-black h-4 px-1.5">{item.amortizationRate.toFixed(1)}% Rate</Badge>
                  </div>
                </>
              ) : (
                <p className="text-slate-300 text-sm italic">No active loan</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Net Payout</p>
              <p className="text-3xl font-black text-slate-900 font-raleway">{formatCurrency(item.netPayout)}</p>
              <div className="flex items-center justify-end gap-1 text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[9px] font-bold">MONTHLY</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Strip (Optional) */}
        {item.amortizationRate > 50 && (
          <div className="bg-amber-50 px-8 py-2 border-t border-amber-100 flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">High Amortization Warning: Over 50% of revenue is servicing debt.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceTab;
