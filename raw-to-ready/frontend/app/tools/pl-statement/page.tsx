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
  Cell,
} from "recharts";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

function PLOutput({ formData }: { formData: Record<string, any> }) {
  const revenue = parseFloat(formData.monthly_revenue) || 0;
  const cogs = parseFloat(formData.cogs) || 0;
  const salaries = parseFloat(formData.salaries) || 0;
  const marketing = parseFloat(formData.marketing) || 0;
  const rent = parseFloat(formData.rent) || 0;
  const software = parseFloat(formData.software) || 0;
  const otherOpex = parseFloat(formData.other_opex) || 0;
  const interest = parseFloat(formData.interest) || 0;
  const taxes = parseFloat(formData.tax_rate) || 0;

  if (!revenue) {
    return <p className="text-sm text-muted">Fill in revenue to see your projected P&L.</p>;
  }

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const totalOpex = salaries + marketing + rent + software + otherOpex;
  const operatingIncome = grossProfit - totalOpex;
  const operatingMargin = revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
  const ebt = operatingIncome - interest;
  const taxAmount = ebt > 0 ? ebt * (taxes / 100) : 0;
  const netIncome = ebt - taxAmount;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  const lineItems = [
    { name: "Revenue", value: revenue, bold: true, color: "text-cream" },
    { name: "COGS", value: -cogs, bold: false, color: "text-red-400" },
    { name: "Gross Profit", value: grossProfit, bold: true, color: grossProfit >= 0 ? "text-green-400" : "text-red-400" },
    { name: "Salaries", value: -salaries, bold: false, color: "text-muted" },
    { name: "Marketing", value: -marketing, bold: false, color: "text-muted" },
    { name: "Rent", value: -rent, bold: false, color: "text-muted" },
    { name: "Software", value: -software, bold: false, color: "text-muted" },
    { name: "Other OpEx", value: -otherOpex, bold: false, color: "text-muted" },
    { name: "Operating Income", value: operatingIncome, bold: true, color: operatingIncome >= 0 ? "text-green-400" : "text-red-400" },
    { name: "Interest", value: -interest, bold: false, color: "text-muted" },
    { name: "Taxes", value: -taxAmount, bold: false, color: "text-muted" },
    { name: "Net Income", value: netIncome, bold: true, color: netIncome >= 0 ? "text-green-400" : "text-red-400" },
  ];

  // Monthly projection over 12 months
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    revenue: Math.round(revenue),
    grossProfit: Math.round(grossProfit),
    netIncome: Math.round(netIncome),
  }));

  const annualNetIncome = netIncome * 12;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Gross Margin</p>
          <p className={`mt-1 font-display text-xl font-bold ${grossMargin > 50 ? "text-green-400" : grossMargin > 20 ? "text-amber" : "text-red-400"}`}>
            {grossMargin.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Operating Margin</p>
          <p className={`mt-1 font-display text-xl font-bold ${operatingMargin > 20 ? "text-green-400" : operatingMargin > 0 ? "text-amber" : "text-red-400"}`}>
            {operatingMargin.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Net Margin</p>
          <p className={`mt-1 font-display text-xl font-bold ${netMargin > 15 ? "text-green-400" : netMargin > 0 ? "text-amber" : "text-red-400"}`}>
            {netMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="rounded-xl border border-white/[0.08] bg-charcoal-lighter">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-xs font-medium text-amber">Monthly Profit & Loss</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {lineItems.map((item) => (
            <div key={item.name} className={`flex items-center justify-between px-4 py-2 ${item.bold ? "bg-white/[0.02]" : ""}`}>
              <span className={`text-sm ${item.bold ? "font-semibold text-cream" : "text-muted pl-4"}`}>{item.name}</span>
              <span className={`text-sm font-mono ${item.color} ${item.bold ? "font-bold" : ""}`}>
                {item.value < 0 ? `-$${Math.abs(item.value).toLocaleString()}` : `$${item.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4 text-center">
        <p className="text-xs text-muted">Projected Annual Net Income</p>
        <p className={`mt-1 font-display text-2xl font-bold ${annualNetIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
          {annualNetIncome < 0 ? "-" : ""}${Math.abs(annualNetIncome).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function PLStatementPage() {
  return (
    <ToolLayout
      toolName="P&L Statement"
      toolSlug="pl_statement"
      description="Build a projected monthly Profit & Loss statement for your business."
      outputSection={PLOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <p className="text-xs font-medium text-amber">Revenue</p>
          <FormField label="Monthly Revenue" value={formData.monthly_revenue || ""} onChange={(v) => setField("monthly_revenue", v)} type="number" prefix="$" placeholder="0" />
          <FormField label="Cost of Goods Sold (COGS)" value={formData.cogs || ""} onChange={(v) => setField("cogs", v)} type="number" prefix="$" placeholder="0" hint="Direct costs of producing goods/services" />

          <p className="text-xs font-medium text-amber">Operating Expenses</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Salaries & Wages" value={formData.salaries || ""} onChange={(v) => setField("salaries", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Marketing & Advertising" value={formData.marketing || ""} onChange={(v) => setField("marketing", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rent & Facilities" value={formData.rent || ""} onChange={(v) => setField("rent", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Software & Tools" value={formData.software || ""} onChange={(v) => setField("software", v)} type="number" prefix="$" placeholder="0" />
          </div>
          <FormField label="Other Operating Expenses" value={formData.other_opex || ""} onChange={(v) => setField("other_opex", v)} type="number" prefix="$" placeholder="0" />

          <p className="text-xs font-medium text-amber">Other</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Interest Expense" value={formData.interest || ""} onChange={(v) => setField("interest", v)} type="number" prefix="$" placeholder="0" hint="Loan/debt interest per month" />
            <FormField label="Tax Rate" value={formData.tax_rate || ""} onChange={(v) => setField("tax_rate", v)} type="number" suffix="%" placeholder="25" />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
