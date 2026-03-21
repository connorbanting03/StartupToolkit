"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField } from "@/components/tools/form-fields";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function RevenueOutput({ formData }: { formData: Record<string, any> }) {
  const price = parseFloat(formData.price_per_unit) || 0;
  const units = parseFloat(formData.units_per_month) || 0;
  const cost = parseFloat(formData.cost_per_unit) || 0;
  const growth = parseFloat(formData.growth_rate) || 0;

  if (!price || !units) {
    return (
      <p className="text-sm text-muted">
        Fill in the fields above to see your revenue projections.
      </p>
    );
  }

  const months = [];
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;

  for (let i = 1; i <= 12; i++) {
    const growthMultiplier = Math.pow(1 + growth / 100, i - 1);
    const monthUnits = Math.round(units * growthMultiplier);
    const revenue = monthUnits * price;
    const costs = monthUnits * cost;
    const profit = revenue - costs;
    cumulativeProfit += profit;

    if (breakEvenMonth === null && cumulativeProfit > 0) {
      breakEvenMonth = i;
    }

    months.push({
      month: `M${i}`,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
    });
  }

  const annualRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const annualProfit = months.reduce((sum, m) => sum + m.profit, 0);

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Annual Revenue</p>
          <p className="mt-1 font-display text-xl font-bold text-cream">
            ${annualRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Annual Profit</p>
          <p className="mt-1 font-display text-xl font-bold text-green-400">
            ${annualProfit.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Break-Even Month</p>
          <p className="mt-1 font-display text-xl font-bold text-amber">
            {breakEvenMonth ? `Month ${breakEvenMonth}` : "N/A"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="month" stroke="#a09880" fontSize={12} />
            <YAxis stroke="#a09880" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e1e",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color: "#f5f0e8",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#d47c2f"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="costs"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber" /> Revenue
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400" /> Profit
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" /> Costs
        </span>
      </div>
    </div>
  );
}

export default function RevenueProjectorPage() {
  return (
    <ToolLayout
      toolName="Revenue Projector"
      toolSlug="revenue_projector"
      description="Project your monthly and annual revenue with growth modeling."
      outputSection={RevenueOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <FormField
            label="Product / Service Name"
            value={formData.product_name || ""}
            onChange={(v) => setField("product_name", v)}
            placeholder="e.g. Handmade Lumber Shelves"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Price Per Unit"
              value={formData.price_per_unit || ""}
              onChange={(v) => setField("price_per_unit", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
            <FormField
              label="Units Sold Per Month"
              value={formData.units_per_month || ""}
              onChange={(v) => setField("units_per_month", v)}
              type="number"
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Cost Per Unit"
              value={formData.cost_per_unit || ""}
              onChange={(v) => setField("cost_per_unit", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
            <FormField
              label="Monthly Growth Rate"
              value={formData.growth_rate || ""}
              onChange={(v) => setField("growth_rate", v)}
              type="number"
              suffix="%"
              placeholder="5"
              hint="Expected month-over-month growth"
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
