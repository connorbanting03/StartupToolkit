"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField } from "@/components/tools/form-fields";
import {
  LineChart,
  Line,
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

function BreakEvenOutput({ formData }: { formData: Record<string, any> }) {
  const fixedCosts = parseFloat(formData.fixed_costs) || 0;
  const variableCostPerUnit = parseFloat(formData.variable_cost_per_unit) || 0;
  const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
  const unitsPerMonth = parseFloat(formData.units_per_month) || 0;
  const growth = parseFloat(formData.growth_rate) || 0;

  if (!pricePerUnit || !fixedCosts) {
    return <p className="text-sm text-muted">Fill in the fields above to see your break-even analysis.</p>;
  }

  const contributionPerUnit = pricePerUnit - variableCostPerUnit;
  const contributionMargin = pricePerUnit > 0 ? (contributionPerUnit / pricePerUnit) * 100 : 0;
  const breakEvenUnits = contributionPerUnit > 0 ? Math.ceil(fixedCosts / contributionPerUnit) : Infinity;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  // Monthly projection: when do cumulative profits cross zero?
  const months: any[] = [];
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;

  for (let i = 1; i <= 24; i++) {
    const growthMultiplier = Math.pow(1 + growth / 100, i - 1);
    const units = Math.round(unitsPerMonth * growthMultiplier);
    const revenue = units * pricePerUnit;
    const variableCosts = units * variableCostPerUnit;
    const profit = revenue - fixedCosts - variableCosts;
    cumulativeProfit += profit;

    if (breakEvenMonth === null && cumulativeProfit > 0) breakEvenMonth = i;

    months.push({
      month: `M${i}`,
      cumulative: Math.round(cumulativeProfit),
      monthly: Math.round(profit),
    });
  }

  // Sensitivity: what if price changes by ±10%, ±20%?
  const sensitivity = [-20, -10, 0, 10, 20].map((pctChange) => {
    const adjPrice = pricePerUnit * (1 + pctChange / 100);
    const adjContrib = adjPrice - variableCostPerUnit;
    const adjBE = adjContrib > 0 ? Math.ceil(fixedCosts / adjContrib) : Infinity;
    return { change: `${pctChange >= 0 ? "+" : ""}${pctChange}%`, units: adjBE, price: adjPrice };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Break-Even Units</p>
          <p className="mt-1 font-display text-xl font-bold text-amber">
            {breakEvenUnits === Infinity ? "N/A" : breakEvenUnits.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Break-Even Revenue</p>
          <p className="mt-1 font-display text-xl font-bold text-cream">
            {breakEvenUnits === Infinity ? "N/A" : `$${breakEvenRevenue.toLocaleString()}`}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Contribution Margin</p>
          <p className={`mt-1 font-display text-xl font-bold ${contributionMargin > 50 ? "text-green-400" : contributionMargin > 20 ? "text-amber" : "text-red-400"}`}>
            {contributionMargin.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Break-Even Month</p>
          <p className="mt-1 font-display text-xl font-bold text-green-400">
            {breakEvenMonth ? `Month ${breakEvenMonth}` : unitsPerMonth > 0 ? "24+ mo" : "—"}
          </p>
        </div>
      </div>

      {unitsPerMonth > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Cumulative Profit Over Time</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
                <YAxis stroke="#a09880" fontSize={11} />
                <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                <ReferenceLine y={0} stroke="#555" strokeDasharray="3 3" label={{ value: "Break-Even", position: "left", fill: "#a09880", fontSize: 10 }} />
                <Area type="monotone" dataKey="cumulative" stroke="#d47c2f" fill="#d47c2f" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Price Sensitivity Analysis</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-2 text-xs font-medium text-muted">Price Change</th>
                <th className="pb-2 text-xs font-medium text-muted">Unit Price</th>
                <th className="pb-2 text-xs font-medium text-muted">Break-Even Units</th>
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((row) => (
                <tr key={row.change} className={`border-b border-white/[0.04] ${row.change === "+0%" ? "bg-amber/5" : ""}`}>
                  <td className="py-2 text-cream">{row.change}</td>
                  <td className="py-2 text-cream">${row.price.toFixed(2)}</td>
                  <td className={`py-2 ${row.units === Infinity ? "text-red-400" : "text-cream"}`}>
                    {row.units === Infinity ? "Never" : row.units.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function BreakEvenPage() {
  return (
    <ToolLayout
      toolName="Break-Even Analyzer"
      toolSlug="break_even"
      description="Calculate exactly how many units or customers you need to cover your costs."
      outputSection={BreakEvenOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <FormField label="Fixed Costs (Monthly)" value={formData.fixed_costs || ""} onChange={(v) => setField("fixed_costs", v)} type="number" prefix="$" placeholder="5000" hint="Rent, salaries, insurance, subscriptions" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price Per Unit" value={formData.price_per_unit || ""} onChange={(v) => setField("price_per_unit", v)} type="number" prefix="$" placeholder="0.00" />
            <FormField label="Variable Cost Per Unit" value={formData.variable_cost_per_unit || ""} onChange={(v) => setField("variable_cost_per_unit", v)} type="number" prefix="$" placeholder="0.00" hint="Materials, shipping, commissions" />
          </div>
          <p className="text-xs font-medium text-amber">Timeline Projection (optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Units / Month" value={formData.units_per_month || ""} onChange={(v) => setField("units_per_month", v)} type="number" placeholder="0" hint="Leave blank for static analysis only" />
            <FormField label="Monthly Growth Rate" value={formData.growth_rate || ""} onChange={(v) => setField("growth_rate", v)} type="number" suffix="%" placeholder="5" />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
