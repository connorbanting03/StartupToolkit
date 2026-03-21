"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField } from "@/components/tools/form-fields";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function CashFlowOutput({ formData }: { formData: Record<string, any> }) {
  const startingCash = parseFloat(formData.starting_cash) || 0;
  const monthlyRevenue = parseFloat(formData.monthly_revenue) || 0;
  const fixedCosts = parseFloat(formData.fixed_costs) || 0;
  const variableCosts = parseFloat(formData.variable_costs) || 0;
  const oneTimeExpenses = parseFloat(formData.one_time_expenses) || 0;
  const paymentTerms = parseInt(formData.payment_terms) || 0;

  if (!startingCash && !monthlyRevenue) {
    return (
      <p className="text-sm text-muted">
        Fill in the fields above to see your cash flow forecast.
      </p>
    );
  }

  const months = [];
  let balance = startingCash;
  let runwayMonths: number | null = null;
  let firstProfitable: number | null = null;

  for (let i = 1; i <= 12; i++) {
    // Revenue delayed by payment terms
    const revenueIn = i > Math.ceil(paymentTerms / 30) ? monthlyRevenue : 0;
    const totalExpenses = fixedCosts + variableCosts + (i === 1 ? oneTimeExpenses : 0);
    const netCashFlow = revenueIn - totalExpenses;
    balance += netCashFlow;

    if (runwayMonths === null && balance <= 0) {
      runwayMonths = i - 1;
    }
    if (firstProfitable === null && netCashFlow > 0) {
      firstProfitable = i;
    }

    months.push({
      month: `M${i}`,
      balance: Math.round(balance),
      inflow: Math.round(revenueIn),
      outflow: Math.round(-totalExpenses),
    });
  }

  if (runwayMonths === null) runwayMonths = 12;

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Runway</p>
          <p className="mt-1 font-display text-xl font-bold text-cream">
            {runwayMonths}+ months
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">First Profitable Month</p>
          <p className="mt-1 font-display text-xl font-bold text-green-400">
            {firstProfitable ? `Month ${firstProfitable}` : "N/A"}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">End Balance (M12)</p>
          <p
            className={`mt-1 font-display text-xl font-bold ${
              (months[11]?.balance ?? 0) >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ${(months[11]?.balance ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months}>
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
            <ReferenceLine y={0} stroke="#555" />
            <Bar dataKey="balance" fill="#d47c2f" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CashFlowPage() {
  return (
    <ToolLayout
      toolName="Cash Flow Forecast"
      toolSlug="cash_flow"
      description="Forecast 12 months of cash flow, runway, and first profitable month."
      outputSection={CashFlowOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Starting Cash"
              value={formData.starting_cash || ""}
              onChange={(v) => setField("starting_cash", v)}
              type="number"
              prefix="$"
              placeholder="10000"
            />
            <FormField
              label="Monthly Revenue"
              value={formData.monthly_revenue || ""}
              onChange={(v) => setField("monthly_revenue", v)}
              type="number"
              prefix="$"
              placeholder="5000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Fixed Costs (monthly)"
              value={formData.fixed_costs || ""}
              onChange={(v) => setField("fixed_costs", v)}
              type="number"
              prefix="$"
              placeholder="2000"
              hint="Rent, salaries, subscriptions"
            />
            <FormField
              label="Variable Costs (monthly)"
              value={formData.variable_costs || ""}
              onChange={(v) => setField("variable_costs", v)}
              type="number"
              prefix="$"
              placeholder="1000"
              hint="Materials, shipping, commissions"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="One-time Expenses"
              value={formData.one_time_expenses || ""}
              onChange={(v) => setField("one_time_expenses", v)}
              type="number"
              prefix="$"
              placeholder="0"
              hint="Equipment, licenses, setup costs"
            />
            <FormField
              label="Payment Terms (days)"
              value={formData.payment_terms || ""}
              onChange={(v) => setField("payment_terms", v)}
              type="number"
              placeholder="30"
              hint="Days until you receive payment"
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
