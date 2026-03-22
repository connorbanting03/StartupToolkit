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
  Legend,
} from "recharts";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

function ScenarioOutput({ formData }: { formData: Record<string, any> }) {
  const baseRevenue = parseFloat(formData.base_revenue) || 0;
  const baseExpenses = parseFloat(formData.base_expenses) || 0;
  const baseGrowth = parseFloat(formData.base_growth) || 0;

  const optimisticGrowthMult = parseFloat(formData.optimistic_growth) || 50;
  const pessimisticGrowthMult = parseFloat(formData.pessimistic_growth) || -30;
  const optimisticExpenseMult = parseFloat(formData.optimistic_expense_change) || -10;
  const pessimisticExpenseMult = parseFloat(formData.pessimistic_expense_change) || 20;

  if (!baseRevenue) {
    return <p className="text-sm text-muted">Enter your base revenue and expenses to see scenario comparisons.</p>;
  }

  const scenarios = [
    {
      name: "Optimistic",
      growth: baseGrowth * (1 + optimisticGrowthMult / 100),
      expenseMult: 1 + optimisticExpenseMult / 100,
      color: "#34d399",
    },
    {
      name: "Realistic",
      growth: baseGrowth,
      expenseMult: 1,
      color: "#d47c2f",
    },
    {
      name: "Pessimistic",
      growth: baseGrowth * (1 + pessimisticGrowthMult / 100),
      expenseMult: 1 + pessimisticExpenseMult / 100,
      color: "#f87171",
    },
  ];

  const months: any[] = [];
  for (let i = 1; i <= 24; i++) {
    const entry: any = { month: `M${i}` };
    scenarios.forEach((s) => {
      const rev = baseRevenue * Math.pow(1 + s.growth / 100, i);
      const exp = baseExpenses * Math.pow(s.expenseMult, i / 12);
      entry[`${s.name} Revenue`] = Math.round(rev);
      entry[`${s.name} Profit`] = Math.round(rev - exp);
    });
    months.push(entry);
  }

  // Year-end summaries
  const y1 = months[11];
  const y2 = months[23];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const m12Rev = y1[`${s.name} Revenue`];
          const m12Profit = y1[`${s.name} Profit`];
          return (
            <div key={s.name} className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs font-medium" style={{ color: s.color }}>{s.name}</p>
              <p className="mt-1 font-display text-lg font-bold text-cream">${m12Rev.toLocaleString()}</p>
              <p className="text-xs text-muted">Month 12 Revenue</p>
              <p className={`mt-2 text-sm font-semibold ${m12Profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {m12Profit < 0 ? "-" : ""}${Math.abs(m12Profit).toLocaleString()} profit
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Revenue Trajectories (24 Months)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
              <YAxis stroke="#a09880" fontSize={11} />
              <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#a09880" }} />
              {scenarios.map((s) => (
                <Line key={s.name} type="monotone" dataKey={`${s.name} Revenue`} stroke={s.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Profit Trajectories (24 Months)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
              <YAxis stroke="#a09880" fontSize={11} />
              <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#a09880" }} />
              {scenarios.map((s) => (
                <Line key={s.name} type="monotone" dataKey={`${s.name} Profit`} stroke={s.color} strokeWidth={2} dot={false} strokeDasharray={s.name === "Realistic" ? "0" : "5 5"} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24-month summary table */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Year-End Comparison</p>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="pb-2 text-xs text-muted">Scenario</th>
              <th className="pb-2 text-xs text-muted">Year 1 Revenue</th>
              <th className="pb-2 text-xs text-muted">Year 1 Profit</th>
              <th className="pb-2 text-xs text-muted">Year 2 Revenue</th>
              <th className="pb-2 text-xs text-muted">Year 2 Profit</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.name} className="border-b border-white/[0.04]">
                <td className="py-2 font-medium" style={{ color: s.color }}>{s.name}</td>
                <td className="py-2 text-cream">${y1[`${s.name} Revenue`].toLocaleString()}</td>
                <td className={`py-2 ${y1[`${s.name} Profit`] >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ${y1[`${s.name} Profit`].toLocaleString()}
                </td>
                <td className="py-2 text-cream">${y2[`${s.name} Revenue`].toLocaleString()}</td>
                <td className={`py-2 ${y2[`${s.name} Profit`] >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ${y2[`${s.name} Profit`].toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ScenarioPlannerPage() {
  return (
    <ToolLayout
      toolName="Scenario Planner"
      toolSlug="scenario_planner"
      description="Compare optimistic, realistic, and pessimistic projections side by side."
      outputSection={ScenarioOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <p className="text-xs font-medium text-amber">Base Case (Realistic)</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Revenue" value={formData.base_revenue || ""} onChange={(v) => setField("base_revenue", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Monthly Expenses" value={formData.base_expenses || ""} onChange={(v) => setField("base_expenses", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <FormField label="Monthly Growth Rate" value={formData.base_growth || ""} onChange={(v) => setField("base_growth", v)} type="number" suffix="%" placeholder="5" />

          <p className="text-xs font-medium text-green-400">Optimistic Adjustments</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Growth Rate Boost" value={formData.optimistic_growth || ""} onChange={(v) => setField("optimistic_growth", v)} type="number" suffix="%" placeholder="50" hint="e.g. 50 = 50% faster than base growth" />
            <FormField label="Expense Change" value={formData.optimistic_expense_change || ""} onChange={(v) => setField("optimistic_expense_change", v)} type="number" suffix="%" placeholder="-10" hint="Negative = expenses decrease" />
          </div>

          <p className="text-xs font-medium text-red-400">Pessimistic Adjustments</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Growth Rate Change" value={formData.pessimistic_growth || ""} onChange={(v) => setField("pessimistic_growth", v)} type="number" suffix="%" placeholder="-30" hint="e.g. -30 = 30% slower than base growth" />
            <FormField label="Expense Change" value={formData.pessimistic_expense_change || ""} onChange={(v) => setField("pessimistic_expense_change", v)} type="number" suffix="%" placeholder="20" hint="Positive = expenses increase" />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
