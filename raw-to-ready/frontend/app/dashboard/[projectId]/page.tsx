"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AppNav } from "@/components/app-nav";
import { api } from "@/lib/api";
import { useProject, invalidateProjects } from "@/lib/hooks/use-api";
import { motion, Reorder } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Calculator,
  DollarSign,
  Truck,
  PiggyBank,
  Sparkles,
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  Rocket,
  BarChart3,
  Target,
  Users,
  FileText,
  Swords,
  GitBranch,
  ClipboardCheck,
  LayoutGrid,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Star } from "lucide-react";

// ─── Tool definitions ───────────────────────────────────────
const TOOL_META: Record<
  string,
  { name: string; icon: any; path: string; color: string }
> = {
  revenue_projector: {
    name: "Revenue Projector",
    icon: TrendingUp,
    path: "/tools/revenue-projector",
    color: "text-amber",
  },
  unit_economics: {
    name: "Unit Economics",
    icon: Calculator,
    path: "/tools/unit-economics",
    color: "text-green-400",
  },
  pricing_calculator: {
    name: "Pricing Strategy",
    icon: DollarSign,
    path: "/tools/pricing-calculator",
    color: "text-blue-400",
  },
  supplier_matrix: {
    name: "Supplier Matrix",
    icon: Truck,
    path: "/tools/supplier-matrix",
    color: "text-purple-400",
  },
  cash_flow: {
    name: "Cash Flow Forecast",
    icon: PiggyBank,
    path: "/tools/cash-flow",
    color: "text-pink-400",
  },
  expense_tracker: {
    name: "Expense Tracker",
    icon: Receipt,
    path: "/tools/expense-tracker",
    color: "text-red-400",
  },
  fundraising: {
    name: "Fundraising & Runway",
    icon: Rocket,
    path: "/tools/fundraising",
    color: "text-orange-400",
  },
  market_sizing: {
    name: "Market Sizing",
    icon: BarChart3,
    path: "/tools/market-sizing",
    color: "text-cyan-400",
  },
  break_even: {
    name: "Break-Even Analyzer",
    icon: Target,
    path: "/tools/break-even",
    color: "text-amber",
  },
  acquisition_planner: {
    name: "Customer Acquisition",
    icon: Users,
    path: "/tools/acquisition-planner",
    color: "text-green-400",
  },
  pl_statement: {
    name: "P&L Statement",
    icon: FileText,
    path: "/tools/pl-statement",
    color: "text-blue-400",
  },
  competitor_scorecard: {
    name: "Competitor Scorecard",
    icon: Swords,
    path: "/tools/competitor-scorecard",
    color: "text-purple-400",
  },
  scenario_planner: {
    name: "Scenario Planner",
    icon: GitBranch,
    path: "/tools/scenario-planner",
    color: "text-pink-400",
  },
  launch_checklist: {
    name: "Launch Checklist",
    icon: ClipboardCheck,
    path: "/tools/launch-checklist",
    color: "text-emerald-400",
  },
  business_model_canvas: {
    name: "Business Model Canvas",
    icon: LayoutGrid,
    path: "/tools/business-model-canvas",
    color: "text-yellow-400",
  },
};

const DEFAULT_ORDER = [
  "revenue_projector",
  "unit_economics",
  "pricing_calculator",
  "supplier_matrix",
  "cash_flow",
  "expense_tracker",
  "fundraising",
  "market_sizing",
  "break_even",
  "acquisition_planner",
  "pl_statement",
  "competitor_scorecard",
  "scenario_planner",
  "launch_checklist",
  "business_model_canvas",
];

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

// ─── Revenue Output ─────────────────────────────────────────
function RevenueCard({ data }: { data: Record<string, any> }) {
  const price = parseFloat(data.price_per_unit) || 0;
  const units = parseFloat(data.units_per_month) || 0;
  const cost = parseFloat(data.cost_per_unit) || 0;
  const growth = parseFloat(data.growth_rate) || 0;
  const projectionMonths = parseInt(data.projection_months) || 12;

  const months = [];
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;

  for (let i = 1; i <= projectionMonths; i++) {
    const growthMultiplier = Math.pow(1 + growth / 100, i - 1);
    const monthUnits = Math.round(units * growthMultiplier);
    const revenue = monthUnits * price;
    const costs = monthUnits * cost;
    const profit = revenue - costs;
    cumulativeProfit += profit;
    if (breakEvenMonth === null && cumulativeProfit > 0) breakEvenMonth = i;
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Metric label={`Revenue (${projectionMonths}mo)`} value={`$${annualRevenue.toLocaleString()}`} />
        <Metric label={`Profit (${projectionMonths}mo)`} value={`$${annualProfit.toLocaleString()}`} color="text-green-400" />
        <Metric label="Break-Even" value={breakEvenMonth ? `Month ${breakEvenMonth}` : "N/A"} color="text-amber" />
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
            <YAxis stroke="#a09880" fontSize={11} />
            <Tooltip contentStyle={CHART_STYLES} />
            <Line type="monotone" dataKey="revenue" stroke="#d47c2f" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Unit Economics Output ──────────────────────────────────
function UnitEconomicsCard({ data }: { data: Record<string, any> }) {
  const cogs = parseFloat(data.cogs) || 0;
  const price = parseFloat(data.selling_price) || 0;
  const shipping = parseFloat(data.shipping_cost) || 0;
  const returnRate = parseFloat(data.return_rate) || 0;
  const cac = parseFloat(data.cac) || 0;
  const ltvMonths = parseInt(data.ltv_months) || 12;

  const totalCost = cogs + shipping;
  const grossProfit = price - totalCost;
  const grossMargin = price > 0 ? (grossProfit / price) * 100 : 0;
  const returnLoss = price * (returnRate / 100);
  const contributionMargin = grossProfit - returnLoss - cac;
  const contributionPct = price > 0 ? (contributionMargin / price) * 100 : 0;
  const ltv = contributionMargin > 0 ? contributionMargin * ltvMonths : contributionMargin;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric
        label="Gross Margin"
        value={`${grossMargin.toFixed(1)}%`}
        sub={`$${grossProfit.toFixed(2)}/unit`}
        color={grossMargin > 50 ? "text-green-400" : grossMargin > 20 ? "text-amber" : "text-red-400"}
      />
      <Metric
        label="Contribution"
        value={`${contributionPct.toFixed(1)}%`}
        sub={`$${contributionMargin.toFixed(2)}/unit`}
        color={contributionPct > 30 ? "text-green-400" : contributionPct > 0 ? "text-amber" : "text-red-400"}
      />
      <Metric
        label={`Est. LTV (${ltvMonths}mo)`}
        value={`$${ltv.toFixed(0)}`}
        color={ltv > 0 ? "text-green-400" : "text-red-400"}
      />
    </div>
  );
}

// ─── Pricing Output ─────────────────────────────────────────
function PricingCard({ data }: { data: Record<string, any> }) {
  const cost = parseFloat(data.cost_per_unit) || 0;
  const comps = [
    parseFloat(data.competitor_price_1) || 0,
    parseFloat(data.competitor_price_2) || 0,
    parseFloat(data.competitor_price_3) || 0,
  ].filter((c) => c > 0);

  const avg = comps.length ? comps.reduce((a, b) => a + b, 0) / comps.length : 0;
  const low = Math.max(cost * 1.5, comps.length ? Math.min(...comps) * 0.9 : cost * 1.5);
  const high = Math.max(cost * 2, comps.length ? Math.max(...comps) * 1.1 : cost * 2);

  const points = [
    { label: "Economy", price: cost * 1.5 },
    { label: "Standard", price: cost * 2 },
    { label: "Premium", price: cost * 3 },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber/20 bg-amber/5 p-3">
        <p className="text-xs font-medium text-amber">Recommended Range</p>
        <p className="font-display text-xl font-bold text-cream">
          ${low.toFixed(2)} — ${high.toFixed(2)}
        </p>
        {avg > 0 && <p className="text-xs text-muted">Competitor avg: ${avg.toFixed(2)}</p>}
      </div>
      <div className="flex gap-2">
        {points.map((pp) => {
          const margin = ((pp.price - cost) / pp.price) * 100;
          return (
            <div key={pp.label} className="flex-1 rounded-lg border border-white/[0.06] bg-charcoal-lighter p-2.5 text-center">
              <p className="text-xs text-muted">{pp.label}</p>
              <p className="font-display text-sm font-bold text-cream">${pp.price.toFixed(2)}</p>
              <p className={`text-xs ${margin > 60 ? "text-green-400" : margin > 30 ? "text-amber" : "text-red-400"}`}>
                {margin.toFixed(0)}% margin
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Supplier Output ────────────────────────────────────────
function SupplierCard({ data }: { data: Record<string, any> }) {
  const suppliers = (data.suppliers || []).filter(
    (s: any) => s.name && s.cost_per_unit
  );
  if (suppliers.length === 0) return <p className="text-sm text-muted">No suppliers entered.</p>;

  const scored = suppliers
    .map((s: any) => ({
      ...s,
      score: (parseFloat(s.cost_per_unit) || 999) * 0.5 + (parseFloat(s.lead_time) || 999) * 0.3,
    }))
    .sort((a: any, b: any) => a.score - b.score);
  const bestName = scored[0]?.name;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="pb-2 text-xs font-medium text-muted">Supplier</th>
            <th className="pb-2 text-xs font-medium text-muted">Cost/Unit</th>
            <th className="pb-2 text-xs font-medium text-muted">MOQ</th>
            <th className="pb-2 text-xs font-medium text-muted">Lead Time</th>
          </tr>
        </thead>
        <tbody>
          {scored.map((s: any, i: number) => (
            <tr key={i} className={`border-b border-white/[0.04] ${s.name === bestName ? "bg-amber/5" : ""}`}>
              <td className="py-2 pr-3">
                <span className={`flex items-center gap-1 ${s.name === bestName ? "font-semibold text-amber" : "text-cream"}`}>
                  {s.name === bestName && <Star className="h-3 w-3 fill-amber text-amber" />}
                  {s.name}
                </span>
              </td>
              <td className="py-2 pr-3 text-cream">${s.cost_per_unit}</td>
              <td className="py-2 pr-3 text-muted">{s.moq || "—"}</td>
              <td className="py-2 text-muted">{s.lead_time ? `${s.lead_time}d` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Cash Flow Output ───────────────────────────────────────
function CashFlowCard({ data }: { data: Record<string, any> }) {
  const startingCash = parseFloat(data.starting_cash) || 0;
  const monthlyRevenue = parseFloat(data.monthly_revenue) || 0;
  const fixedCosts = parseFloat(data.fixed_costs) || 0;
  const variableCosts = parseFloat(data.variable_costs) || 0;
  const oneTimeExpenses = parseFloat(data.one_time_expenses) || 0;
  const paymentTerms = parseInt(data.payment_terms) || 0;
  const forecastMonths = parseInt(data.forecast_months) || 12;

  const months = [];
  let balance = startingCash;
  let runwayMonths: number | null = null;

  for (let i = 1; i <= forecastMonths; i++) {
    const revenueIn = i > Math.ceil(paymentTerms / 30) ? monthlyRevenue : 0;
    const expenses = fixedCosts + variableCosts + (i === 1 ? oneTimeExpenses : 0);
    balance += revenueIn - expenses;
    if (runwayMonths === null && balance <= 0) runwayMonths = i - 1;
    months.push({ month: `M${i}`, balance: Math.round(balance) });
  }
  if (runwayMonths === null) runwayMonths = forecastMonths;

  const lastMonth = months[months.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Runway" value={`${runwayMonths}+ months`} />
        <Metric
          label={`End Balance (M${forecastMonths})`}
          value={`$${(lastMonth?.balance ?? 0).toLocaleString()}`}
          color={(lastMonth?.balance ?? 0) >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
            <YAxis stroke="#a09880" fontSize={11} />
            <Tooltip contentStyle={CHART_STYLES} />
            <ReferenceLine y={0} stroke="#555" />
            <Bar dataKey="balance" fill="#d47c2f" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Shared metric card ─────────────────────────────────────
function Metric({
  label,
  value,
  sub,
  color = "text-cream",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 font-display text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted/60">{sub}</p>}
    </div>
  );
}

// ─── Expense Tracker Output ─────────────────────────────────
function ExpenseCard({ data }: { data: Record<string, any> }) {
  const categories = ["rent", "salaries", "marketing", "software", "insurance", "utilities", "supplies", "other_expenses"];
  const total = categories.reduce((s, k) => s + (parseFloat(data[k]) || 0), 0);
  const biggest = categories.reduce((a, b) => (parseFloat(data[a]) || 0) >= (parseFloat(data[b]) || 0) ? a : b);
  const biggestVal = parseFloat(data[biggest]) || 0;

  if (!total) return <p className="text-sm text-muted">No expenses entered.</p>;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="Monthly Burn" value={`$${total.toLocaleString()}`} color="text-red-400" />
      <Metric label="Annual Total" value={`$${(total * 12).toLocaleString()}`} />
      <Metric label="Biggest Item" value={biggest.replace("_", " ")} sub={`$${biggestVal.toLocaleString()}`} color="text-amber" />
    </div>
  );
}

// ─── Fundraising Output ─────────────────────────────────────
function FundraisingCard({ data }: { data: Record<string, any> }) {
  const cash = parseFloat(data.current_cash) || 0;
  const burn = parseFloat(data.monthly_burn) || 0;
  const rev = parseFloat(data.monthly_revenue) || 0;
  const raise = parseFloat(data.target_raise) || 0;
  const preMoney = parseFloat(data.pre_money_valuation) || 0;

  const netBurn = burn - rev;
  const runway = netBurn > 0 ? Math.round(cash / netBurn) : 99;
  const dilution = preMoney > 0 ? ((raise / (preMoney + raise)) * 100).toFixed(1) : "—";

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="Current Runway" value={`${runway} months`} color={runway < 6 ? "text-red-400" : runway < 12 ? "text-amber" : "text-green-400"} />
      <Metric label="Target Raise" value={raise ? `$${raise.toLocaleString()}` : "—"} />
      <Metric label="Dilution" value={typeof dilution === "string" && dilution !== "—" ? `${dilution}%` : "—"} color="text-amber" />
    </div>
  );
}

// ─── Market Sizing Output ───────────────────────────────────
function MarketCard({ data }: { data: Record<string, any> }) {
  const tam = parseFloat(data.tam) || 0;
  const samPct = parseFloat(data.sam_percent) || 0;
  const somPct = parseFloat(data.som_percent) || 0;
  const sam = tam * (samPct / 100);
  const som = sam * (somPct / 100);

  if (!tam) return <p className="text-sm text-muted">No market size entered.</p>;

  const fmt = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${v.toLocaleString()}`;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="TAM" value={fmt(tam)} color="text-blue-400" />
      <Metric label="SAM" value={fmt(sam)} color="text-amber" />
      <Metric label="SOM" value={fmt(som)} color="text-green-400" />
    </div>
  );
}

// ─── Break-Even Output ──────────────────────────────────────
function BreakEvenCard({ data }: { data: Record<string, any> }) {
  const fixedCosts = parseFloat(data.fixed_costs) || 0;
  const variable = parseFloat(data.variable_cost_per_unit) || 0;
  const price = parseFloat(data.price_per_unit) || 0;
  const contrib = price - variable;
  const beUnits = contrib > 0 ? Math.ceil(fixedCosts / contrib) : Infinity;
  const beRevenue = beUnits * price;
  const margin = price > 0 ? ((contrib / price) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="Break-Even Units" value={beUnits === Infinity ? "N/A" : beUnits.toLocaleString()} color="text-amber" />
      <Metric label="Break-Even Rev" value={beUnits === Infinity ? "N/A" : `$${beRevenue.toLocaleString()}`} />
      <Metric label="Contribution Margin" value={`${margin}%`} color={parseFloat(margin) > 50 ? "text-green-400" : "text-amber"} />
    </div>
  );
}

// ─── Acquisition Output ─────────────────────────────────────
function AcquisitionCard({ data }: { data: Record<string, any> }) {
  const channels = ["organic", "paid", "social", "referral", "other_channel"];
  const totalSpend = channels.reduce((s, c) => s + (parseFloat(data[`${c}_spend`]) || 0), 0);
  const totalCustomers = channels.reduce((s, c) => s + (parseFloat(data[`${c}_customers`]) || 0), 0);
  const blendedCac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
  const ltv = parseFloat(data.customer_ltv) || 0;
  const ratio = blendedCac > 0 && ltv > 0 ? (ltv / blendedCac).toFixed(1) : "—";

  if (!totalSpend && !totalCustomers) return <p className="text-sm text-muted">No acquisition data entered.</p>;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="Blended CAC" value={`$${blendedCac.toFixed(0)}`} color="text-amber" />
      <Metric label="Customers/mo" value={totalCustomers.toString()} />
      <Metric label="LTV:CAC" value={typeof ratio === "string" ? ratio : `${ratio}x`} color={parseFloat(ratio as string) >= 3 ? "text-green-400" : "text-red-400"} />
    </div>
  );
}

// ─── P&L Output ─────────────────────────────────────────────
function PLCard({ data }: { data: Record<string, any> }) {
  const revenue = parseFloat(data.monthly_revenue) || 0;
  const cogs = parseFloat(data.cogs) || 0;
  const salaries = parseFloat(data.salaries) || 0;
  const marketing = parseFloat(data.marketing) || 0;
  const rent = parseFloat(data.rent) || 0;
  const software = parseFloat(data.software) || 0;
  const otherOpex = parseFloat(data.other_opex) || 0;

  const grossProfit = revenue - cogs;
  const netIncome = grossProfit - salaries - marketing - rent - software - otherOpex;
  const netMargin = revenue > 0 ? ((netIncome / revenue) * 100).toFixed(1) : "0";

  if (!revenue) return <p className="text-sm text-muted">No revenue entered.</p>;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="Revenue" value={`$${revenue.toLocaleString()}`} />
      <Metric label="Net Income" value={`$${netIncome.toLocaleString()}`} color={netIncome >= 0 ? "text-green-400" : "text-red-400"} />
      <Metric label="Net Margin" value={`${netMargin}%`} color={parseFloat(netMargin) > 15 ? "text-green-400" : parseFloat(netMargin) > 0 ? "text-amber" : "text-red-400"} />
    </div>
  );
}

// ─── Competitor Output ──────────────────────────────────────
function CompetitorCard({ data }: { data: Record<string, any> }) {
  const dims = ["price", "features", "ux", "support", "brand", "speed"];
  const yourAvg = dims.reduce((s, d) => s + (parseFloat(data[`your_${d}`]) || 0), 0) / dims.length;
  const comp1 = data.comp1_name;
  const comp1Avg = comp1 ? dims.reduce((s, d) => s + (parseFloat(data[`comp1_${d}`]) || 0), 0) / dims.length : 0;

  if (!yourAvg) return <p className="text-sm text-muted">No scores entered.</p>;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label={data.your_company || "You"} value={`${yourAvg.toFixed(1)}/10`} color="text-amber" />
      {comp1 && <Metric label={comp1} value={`${comp1Avg.toFixed(1)}/10`} color="text-blue-400" />}
      <Metric label="Dimensions" value={`${dims.filter((d) => (parseFloat(data[`your_${d}`]) || 0) >= 8).length} strengths`} color="text-green-400" />
    </div>
  );
}

// ─── Scenario Output ────────────────────────────────────────
function ScenarioCard({ data }: { data: Record<string, any> }) {
  const rev = parseFloat(data.base_revenue) || 0;
  const exp = parseFloat(data.base_expenses) || 0;
  const growth = parseFloat(data.base_growth) || 0;

  if (!rev) return <p className="text-sm text-muted">No base case entered.</p>;

  const m12Rev = rev * Math.pow(1 + growth / 100, 12);
  const profit = m12Rev - exp;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Metric label="M12 Revenue" value={`$${Math.round(m12Rev).toLocaleString()}`} />
      <Metric label="Monthly Growth" value={`${growth}%`} color="text-amber" />
      <Metric label="M12 Profit" value={`$${Math.round(profit).toLocaleString()}`} color={profit >= 0 ? "text-green-400" : "text-red-400"} />
    </div>
  );
}

// ─── Launch Checklist Output ────────────────────────────────
function LaunchCard({ data }: { data: Record<string, any> }) {
  const allKeys = [
    "register_business", "ein", "business_license", "trademark", "terms_privacy", "contracts",
    "mvp_defined", "mvp_built", "beta_testing", "feedback_loop", "analytics", "error_monitoring",
    "business_bank", "accounting", "payment_processor", "pricing", "financial_model", "bookkeeper",
    "website_live", "domain_email", "social_profiles", "content_plan", "launch_campaign", "crm",
    "hosting", "security", "backup", "support_system", "documentation", "onboarding",
  ];
  const completed = allKeys.filter((k) => data[k] === "true" || data[k] === true).length;
  const pct = Math.round((completed / allKeys.length) * 100);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Launch Readiness" value={`${pct}%`} color={pct === 100 ? "text-green-400" : pct > 60 ? "text-amber" : "text-cream"} />
        <Metric label="Completed" value={`${completed}/${allKeys.length}`} />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal-lighter">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#34d399" : "#d47c2f" }} />
      </div>
    </div>
  );
}

// ─── Business Model Canvas Output ───────────────────────────
const BMC_SECTIONS = [
  { key: "key_partners", label: "Key Partners", color: "#a78bfa", gridArea: "kp" },
  { key: "key_activities", label: "Key Activities", color: "#60a5fa", gridArea: "ka" },
  { key: "key_resources", label: "Key Resources", color: "#34d399", gridArea: "kr" },
  { key: "value_propositions", label: "Value Propositions", color: "#d47c2f", gridArea: "vp" },
  { key: "customer_relationships", label: "Customer Relationships", color: "#f472b6", gridArea: "cr" },
  { key: "channels", label: "Channels", color: "#22d3ee", gridArea: "ch" },
  { key: "customer_segments", label: "Customer Segments", color: "#fb923c", gridArea: "cs" },
  { key: "cost_structure", label: "Cost Structure", color: "#ef4444", gridArea: "cost" },
  { key: "revenue_streams", label: "Revenue Streams", color: "#22c55e", gridArea: "rev" },
];

function BMCCard({ data }: { data: Record<string, any> }) {
  const filled = BMC_SECTIONS.filter((s) => data[s.key]?.trim()).length;
  if (filled === 0) return <p className="text-sm text-muted">Canvas is empty — open the tool to fill it out.</p>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BMC_SECTIONS.map((section) => {
          const content = data[section.key] || "";
          const lines = content.split("\n").map((l: string) => l.trim()).filter((l: string) => l);

          return (
            <div
              key={section.key}
              className="rounded-md border border-white/[0.06] bg-charcoal p-2.5"
            >
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: section.color }}>
                {section.label}
              </p>
              {lines.length > 0 ? (
                <ul className="space-y-0.5">
                  {lines.map((line: string, i: number) => (
                    <li key={i} className="text-[10px] leading-snug text-cream/70">
                      {line.replace(/^[-•]\s*/, "• ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[9px] italic text-muted/30">Empty</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted">
        <span>{filled}/9 sections</span>
        <span>•</span>
        <span>{Math.round((filled / 9) * 100)}% complete</span>
      </div>
    </div>
  );
}

// ─── Tool card renderer ─────────────────────────────────────
const TOOL_RENDERERS: Record<string, (data: Record<string, any>) => React.ReactNode> = {
  revenue_projector: (d) => <RevenueCard data={d} />,
  unit_economics: (d) => <UnitEconomicsCard data={d} />,
  pricing_calculator: (d) => <PricingCard data={d} />,
  supplier_matrix: (d) => <SupplierCard data={d} />,
  cash_flow: (d) => <CashFlowCard data={d} />,
  expense_tracker: (d) => <ExpenseCard data={d} />,
  fundraising: (d) => <FundraisingCard data={d} />,
  market_sizing: (d) => <MarketCard data={d} />,
  break_even: (d) => <BreakEvenCard data={d} />,
  acquisition_planner: (d) => <AcquisitionCard data={d} />,
  pl_statement: (d) => <PLCard data={d} />,
  competitor_scorecard: (d) => <CompetitorCard data={d} />,
  scenario_planner: (d) => <ScenarioCard data={d} />,
  launch_checklist: (d) => <LaunchCard data={d} />,
  business_model_canvas: (d) => <BMCCard data={d} />,
};

interface ToolInstance {
  id: string;
  tool_name: string;
  label: string | null;
  input_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ─── Main Page ──────────────────────────────────────────────
export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { project, isLoading: projectLoading, mutate: mutateProject } = useProject(projectId);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  const handleDelete = async (inst: ToolInstance) => {
    setDeleting(inst.id);
    setOpenMenu(null);
    try {
      await api.deleteToolInstance(inst.tool_name, inst.id);
      setCardOrder((prev) => prev.filter((id) => id !== inst.id));
      await mutateProject();
      invalidateProjects();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // Build card order from instances once loaded
  useEffect(() => {
    if (!project?.tool_instances) return;
    const instances: ToolInstance[] = project.tool_instances;
    // Try restoring saved order, filtering out stale IDs
    const saved = localStorage.getItem(`layout-${projectId}`);
    if (saved) {
      try {
        const savedOrder: string[] = JSON.parse(saved);
        const currentIds = new Set(instances.map((i) => i.id));
        const restored = savedOrder.filter((id) => currentIds.has(id));
        const newIds = instances
          .map((i) => i.id)
          .filter((id) => !restored.includes(id));
        setCardOrder([...newIds, ...restored]);
        return;
      } catch {
        /* ignore */
      }
    }
    setCardOrder([...instances].reverse().map((i) => i.id));
    // BMC cards start expanded
    setCollapsedCards({});
  }, [project?.tool_instances, projectId]);

  // Persist layout
  useEffect(() => {
    if (!projectId || cardOrder.length === 0) return;
    localStorage.setItem(`layout-${projectId}`, JSON.stringify(cardOrder));
  }, [cardOrder, projectId]);

  if (authLoading || projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-charcoal">
        <p className="text-muted">Project not found.</p>
        <Link href="/dashboard" className="mt-2 text-sm text-amber hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const instances: ToolInstance[] = project.tool_instances || [];
  const instanceMap = new Map(instances.map((i) => [i.id, i]));
  const completedTools: string[] = project.completed_tools || [];
  const breadcrumbs = project.breadcrumbs || [];

  // Group instance counts by tool type for the "add" buttons
  const countByTool: Record<string, number> = {};
  for (const inst of instances) {
    countByTool[inst.tool_name] = (countByTool[inst.tool_name] || 0) + 1;
  }

  return (
    <div className="min-h-screen bg-charcoal pb-20 pt-24">
      <AppNav />

      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-3 w-3" />
            All Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="mt-1 text-sm text-muted">{project.description}</p>
              )}
            </div>
            <Link
              href={`/recommendations?project=${projectId}`}
              className="flex items-center gap-1.5 rounded-lg bg-amber/10 px-4 py-2 text-sm font-medium text-amber transition-colors hover:bg-amber/20"
            >
              <Sparkles className="h-4 w-4" />
              Recommendations
            </Link>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>
                {completedTools.length}/{DEFAULT_ORDER.length} tools used
              </span>
              <span>{instances.length} {instances.length === 1 ? "entry" : "entries"}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal-lighter">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber/60 to-amber"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTools.length / DEFAULT_ORDER.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Add new entry buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {DEFAULT_ORDER.map((slug) => {
            const meta = TOOL_META[slug];
            const count = countByTool[slug] || 0;
            const Icon = meta.icon;
            return (
              <Link
                key={slug}
                href={`${meta.path}?project=${projectId}`}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-charcoal-light px-3 py-1.5 text-xs text-muted transition-colors hover:border-amber/30 hover:text-cream"
              >
                <Plus className="h-3 w-3" />
                <Icon className={`h-3 w-3 ${meta.color}`} />
                {meta.name}
                {count > 0 && (
                  <span className="rounded-full bg-amber/10 px-1.5 text-[10px] text-amber">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Instance cards — reorderable, only filled-out ones */}
        {instances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center"
          >
            <p className="text-sm text-muted">No entries yet. Use the buttons above to fill out your first tool.</p>
          </motion.div>
        ) : (
          <Reorder.Group
            axis="y"
            values={cardOrder}
            onReorder={setCardOrder}
            className="space-y-4"
          >
            {cardOrder.map((instanceId) => {
              const inst = instanceMap.get(instanceId);
              if (!inst) return null;
              const meta = TOOL_META[inst.tool_name];
              if (!meta) return null;
              const Icon = meta.icon;
              const renderer = TOOL_RENDERERS[inst.tool_name];

              return (
                <Reorder.Item
                  key={instanceId}
                  value={instanceId}
                  className="rounded-2xl border border-white/[0.08] bg-charcoal-light"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 cursor-grab text-muted/40 active:cursor-grabbing" />
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                      <div>
                        <h3 className="font-display text-sm font-semibold text-cream">
                          {inst.label || meta.name}
                        </h3>
                        {inst.label && (
                          <p className="text-[10px] text-muted">{meta.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {inst.tool_name === "business_model_canvas" && (
                        <button
                          onClick={() => setCollapsedCards((prev) => ({ ...prev, [inst.id]: !prev[inst.id] }))}
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-cream"
                        >
                          <svg
                            className={`h-4 w-4 transition-transform ${collapsedCards[inst.id] ? "-rotate-90" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                      <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === inst.id ? null : inst.id)}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-cream"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === inst.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-white/[0.08] bg-charcoal-lighter shadow-lg">
                            <Link
                              href={`${meta.path}?project=${projectId}&instance=${inst.id}`}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-cream transition-colors hover:bg-white/[0.06]"
                              onClick={() => setOpenMenu(null)}
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(inst)}
                              disabled={deleting === inst.id}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              {deleting === inst.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    </div>
                  </div>
                  {(inst.tool_name !== "business_model_canvas" || !collapsedCards[inst.id]) && (
                  <div className={`p-5 ${deleting === inst.id ? "opacity-40 pointer-events-none" : ""}`}>
                    {renderer ? renderer(inst.input_data) : (
                      <p className="text-sm text-muted">Unknown tool type.</p>
                    )}
                  </div>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
