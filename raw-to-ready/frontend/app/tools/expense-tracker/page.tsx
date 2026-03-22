"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField } from "@/components/tools/form-fields";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#d47c2f", "#34d399", "#60a5fa", "#a78bfa", "#f87171", "#fbbf24", "#e879f9", "#2dd4bf"];

function ExpenseOutput({ formData }: { formData: Record<string, any> }) {
  const rent = parseFloat(formData.rent) || 0;
  const salaries = parseFloat(formData.salaries) || 0;
  const marketing = parseFloat(formData.marketing) || 0;
  const software = parseFloat(formData.software) || 0;
  const insurance = parseFloat(formData.insurance) || 0;
  const utilities = parseFloat(formData.utilities) || 0;
  const supplies = parseFloat(formData.supplies) || 0;
  const other = parseFloat(formData.other_expenses) || 0;
  const oneTime = parseFloat(formData.one_time_costs) || 0;

  const monthlyTotal = rent + salaries + marketing + software + insurance + utilities + supplies + other;
  const annualTotal = monthlyTotal * 12 + oneTime;

  if (monthlyTotal === 0 && oneTime === 0) {
    return <p className="text-sm text-muted">Fill in expenses above to see your breakdown.</p>;
  }

  const breakdown = [
    { name: "Rent / Facilities", value: rent },
    { name: "Salaries / Labor", value: salaries },
    { name: "Marketing / Ads", value: marketing },
    { name: "Software / Tools", value: software },
    { name: "Insurance", value: insurance },
    { name: "Utilities", value: utilities },
    { name: "Supplies / Materials", value: supplies },
    { name: "Other", value: other },
  ].filter((e) => e.value > 0);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    fixed: rent + salaries + insurance + utilities + software,
    variable: marketing + supplies + other,
    oneTime: i === 0 ? oneTime : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Monthly Burn</p>
          <p className="mt-1 font-display text-xl font-bold text-red-400">${monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Annual Total</p>
          <p className="mt-1 font-display text-xl font-bold text-cream">${annualTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Biggest Expense</p>
          <p className="mt-1 font-display text-sm font-bold text-amber">
            {breakdown.length > 0 ? breakdown.sort((a, b) => b.value - a.value)[0].name : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Expense Breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f0e8" }}
                  formatter={(v: any) => `$${Number(v).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {breakdown.map((e, i) => (
              <span key={e.name} className="flex items-center gap-1 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {e.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">Monthly Expense Projection</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
                <YAxis stroke="#a09880" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f5f0e8" }} />
                <Bar dataKey="fixed" stackId="a" fill="#d47c2f" name="Fixed" />
                <Bar dataKey="variable" stackId="a" fill="#60a5fa" name="Variable" />
                <Bar dataKey="oneTime" stackId="a" fill="#f87171" name="One-Time" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseTrackerPage() {
  return (
    <ToolLayout
      toolName="Expense Tracker"
      toolSlug="expense_tracker"
      description="Track and categorize your startup expenses to understand your monthly burn rate."
      outputSection={ExpenseOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <SelectField
            label="Business Stage"
            value={formData.business_stage || ""}
            onChange={(v) => setField("business_stage", v)}
            options={[
              { value: "idea", label: "Idea / Pre-Revenue" },
              { value: "early", label: "Early Stage (0–12 months)" },
              { value: "growth", label: "Growth Stage (1–3 years)" },
              { value: "established", label: "Established (3+ years)" },
            ]}
          />
          <p className="text-xs font-medium text-amber">Monthly Recurring Expenses</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rent / Facilities" value={formData.rent || ""} onChange={(v) => setField("rent", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Salaries / Labor" value={formData.salaries || ""} onChange={(v) => setField("salaries", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Marketing / Ads" value={formData.marketing || ""} onChange={(v) => setField("marketing", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Software / Tools" value={formData.software || ""} onChange={(v) => setField("software", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Insurance" value={formData.insurance || ""} onChange={(v) => setField("insurance", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Utilities" value={formData.utilities || ""} onChange={(v) => setField("utilities", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Supplies / Materials" value={formData.supplies || ""} onChange={(v) => setField("supplies", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Other Monthly Expenses" value={formData.other_expenses || ""} onChange={(v) => setField("other_expenses", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <p className="text-xs font-medium text-amber">One-Time / Setup Costs</p>
          <FormField label="One-Time Costs" value={formData.one_time_costs || ""} onChange={(v) => setField("one_time_costs", v)} type="number" prefix="$" placeholder="0" hint="Equipment, licenses, legal fees, etc." />
        </div>
      )}
    </ToolLayout>
  );
}
