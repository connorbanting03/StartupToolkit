"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

function FundraisingOutput({ formData }: { formData: Record<string, any> }) {
  const currentCash = parseFloat(formData.current_cash) || 0;
  const monthlyBurn = parseFloat(formData.monthly_burn) || 0;
  const monthlyRevenue = parseFloat(formData.monthly_revenue) || 0;
  const targetRaise = parseFloat(formData.target_raise) || 0;
  const preMoneyVal = parseFloat(formData.pre_money_valuation) || 0;
  const burnGrowth = parseFloat(formData.burn_growth_rate) || 0;
  const revenueGrowth = parseFloat(formData.revenue_growth_rate) || 0;

  if (!currentCash && !monthlyBurn) {
    return <p className="text-sm text-muted">Fill in the fields above to see your runway analysis.</p>;
  }

  const netBurn = monthlyBurn - monthlyRevenue;
  const currentRunway = netBurn > 0 ? Math.floor(currentCash / netBurn) : 999;
  const postRaiseCash = currentCash + targetRaise;
  const dilution = preMoneyVal > 0 ? (targetRaise / (preMoneyVal + targetRaise)) * 100 : 0;
  const postMoneyVal = preMoneyVal + targetRaise;

  // Project cash balance over 24 months, with & without raise
  const months: any[] = [];
  let balanceNoRaise = currentCash;
  let balanceWithRaise = postRaiseCash;
  let runwayNoRaise: number | null = null;
  let runwayWithRaise: number | null = null;

  for (let i = 1; i <= 24; i++) {
    const burnMultiplier = Math.pow(1 + burnGrowth / 100, i - 1);
    const revMultiplier = Math.pow(1 + revenueGrowth / 100, i - 1);
    const burn = monthlyBurn * burnMultiplier;
    const rev = monthlyRevenue * revMultiplier;
    const net = burn - rev;

    balanceNoRaise -= net;
    balanceWithRaise -= net;

    if (runwayNoRaise === null && balanceNoRaise <= 0) runwayNoRaise = i;
    if (runwayWithRaise === null && balanceWithRaise <= 0) runwayWithRaise = i;

    months.push({
      month: `M${i}`,
      withoutRaise: Math.round(Math.max(balanceNoRaise, -currentCash)),
      withRaise: targetRaise > 0 ? Math.round(Math.max(balanceWithRaise, -postRaiseCash)) : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Current Runway</p>
          <p className={`mt-1 font-display text-xl font-bold ${currentRunway < 6 ? "text-red-400" : currentRunway < 12 ? "text-amber" : "text-green-400"}`}>
            {currentRunway >= 999 ? "∞" : `${currentRunway} mo`}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Net Monthly Burn</p>
          <p className="mt-1 font-display text-xl font-bold text-red-400">${netBurn.toLocaleString()}</p>
        </div>
        {targetRaise > 0 && (
          <>
            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs text-muted">Post-Raise Runway</p>
              <p className="mt-1 font-display text-xl font-bold text-green-400">
                {runwayWithRaise ? `${runwayWithRaise} mo` : "24+ mo"}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs text-muted">Dilution</p>
              <p className="mt-1 font-display text-xl font-bold text-amber">{dilution.toFixed(1)}%</p>
            </div>
          </>
        )}
      </div>

      {targetRaise > 0 && preMoneyVal > 0 && (
        <div className="rounded-lg border border-amber/20 bg-amber/5 p-4">
          <p className="text-xs font-medium text-amber">Equity Summary</p>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-muted">Pre-Money</p><p className="font-bold text-cream">${preMoneyVal.toLocaleString()}</p></div>
            <div><p className="text-muted">Post-Money</p><p className="font-bold text-cream">${postMoneyVal.toLocaleString()}</p></div>
            <div><p className="text-muted">Investor Ownership</p><p className="font-bold text-cream">{dilution.toFixed(1)}%</p></div>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Cash Balance Projection (24 months)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
              <YAxis stroke="#a09880" fontSize={11} />
              <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <ReferenceLine y={0} stroke="#555" />
              <Area type="monotone" dataKey="withoutRaise" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Without Raise" />
              {targetRaise > 0 && (
                <Area type="monotone" dataKey="withRaise" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} name="With Raise" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function FundraisingPage() {
  return (
    <ToolLayout
      toolName="Fundraising & Runway"
      toolSlug="fundraising"
      description="Calculate your runway, model funding rounds, and understand dilution."
      outputSection={FundraisingOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <p className="text-xs font-medium text-amber">Current Financials</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cash on Hand" value={formData.current_cash || ""} onChange={(v) => setField("current_cash", v)} type="number" prefix="$" placeholder="50000" />
            <FormField label="Monthly Burn Rate" value={formData.monthly_burn || ""} onChange={(v) => setField("monthly_burn", v)} type="number" prefix="$" placeholder="10000" hint="Total monthly expenses" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Revenue" value={formData.monthly_revenue || ""} onChange={(v) => setField("monthly_revenue", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Revenue Growth Rate" value={formData.revenue_growth_rate || ""} onChange={(v) => setField("revenue_growth_rate", v)} type="number" suffix="%" placeholder="5" hint="Monthly revenue growth" />
          </div>
          <FormField label="Burn Growth Rate" value={formData.burn_growth_rate || ""} onChange={(v) => setField("burn_growth_rate", v)} type="number" suffix="%" placeholder="2" hint="Monthly increase in expenses (hiring, scaling)" />

          <p className="text-xs font-medium text-amber">Funding Round</p>
          <SelectField
            label="Round Type"
            value={formData.round_type || ""}
            onChange={(v) => setField("round_type", v)}
            options={[
              { value: "pre_seed", label: "Pre-Seed" },
              { value: "seed", label: "Seed" },
              { value: "series_a", label: "Series A" },
              { value: "series_b", label: "Series B" },
              { value: "angel", label: "Angel Investment" },
              { value: "convertible", label: "Convertible Note / SAFE" },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Target Raise" value={formData.target_raise || ""} onChange={(v) => setField("target_raise", v)} type="number" prefix="$" placeholder="500000" />
            <FormField label="Pre-Money Valuation" value={formData.pre_money_valuation || ""} onChange={(v) => setField("pre_money_valuation", v)} type="number" prefix="$" placeholder="2000000" />
          </div>
          <TextAreaField
            label="Use of Funds"
            value={formData.use_of_funds || ""}
            onChange={(v) => setField("use_of_funds", v)}
            placeholder="e.g. 40% product development, 30% marketing, 20% hiring, 10% operations"
          />
        </div>
      )}
    </ToolLayout>
  );
}
