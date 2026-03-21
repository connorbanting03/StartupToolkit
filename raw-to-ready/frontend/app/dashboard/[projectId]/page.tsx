"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AppNav } from "@/components/app-nav";
import { api } from "@/lib/api";
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
};

const DEFAULT_ORDER = [
  "revenue_projector",
  "unit_economics",
  "pricing_calculator",
  "supplier_matrix",
  "cash_flow",
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
        <Metric label="Annual Revenue" value={`$${annualRevenue.toLocaleString()}`} />
        <Metric label="Annual Profit" value={`$${annualProfit.toLocaleString()}`} color="text-green-400" />
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

  const totalCost = cogs + shipping;
  const grossProfit = price - totalCost;
  const grossMargin = price > 0 ? (grossProfit / price) * 100 : 0;
  const returnLoss = price * (returnRate / 100);
  const contributionMargin = grossProfit - returnLoss - cac;
  const contributionPct = price > 0 ? (contributionMargin / price) * 100 : 0;
  const ltv = contributionMargin > 0 ? contributionMargin * 12 : contributionMargin;

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
        label="Est. Annual LTV"
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

  const months = [];
  let balance = startingCash;
  let runwayMonths: number | null = null;

  for (let i = 1; i <= 12; i++) {
    const revenueIn = i > Math.ceil(paymentTerms / 30) ? monthlyRevenue : 0;
    const expenses = fixedCosts + variableCosts + (i === 1 ? oneTimeExpenses : 0);
    balance += revenueIn - expenses;
    if (runwayMonths === null && balance <= 0) runwayMonths = i - 1;
    months.push({ month: `M${i}`, balance: Math.round(balance) });
  }
  if (runwayMonths === null) runwayMonths = 12;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Runway" value={`${runwayMonths}+ months`} />
        <Metric
          label="End Balance (M12)"
          value={`$${(months[11]?.balance ?? 0).toLocaleString()}`}
          color={(months[11]?.balance ?? 0) >= 0 ? "text-green-400" : "text-red-400"}
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

// ─── Tool card renderer ─────────────────────────────────────
const TOOL_RENDERERS: Record<string, (data: Record<string, any>) => React.ReactNode> = {
  revenue_projector: (d) => <RevenueCard data={d} />,
  unit_economics: (d) => <UnitEconomicsCard data={d} />,
  pricing_calculator: (d) => <PricingCard data={d} />,
  supplier_matrix: (d) => <SupplierCard data={d} />,
  cash_flow: (d) => <CashFlowCard data={d} />,
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

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (inst: ToolInstance) => {
    setDeleting(inst.id);
    setOpenMenu(null);
    try {
      await api.deleteToolInstance(inst.tool_name, inst.id);
      setCardOrder((prev) => prev.filter((id) => id !== inst.id));
      await loadProject();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (user) loadProject();
  }, [user, loadProject]);

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
        setCardOrder([...restored, ...newIds]);
        return;
      } catch {
        /* ignore */
      }
    }
    setCardOrder(instances.map((i) => i.id));
  }, [project?.tool_instances, projectId]);

  // Persist layout
  useEffect(() => {
    if (!projectId || cardOrder.length === 0) return;
    localStorage.setItem(`layout-${projectId}`, JSON.stringify(cardOrder));
  }, [cardOrder, projectId]);

  if (authLoading || loading) {
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
              Recommendations ({breadcrumbs.length})
            </Link>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>
                {instances.length} {instances.length === 1 ? "entry" : "entries"} across{" "}
                {completedTools.length}/5 tool types
              </span>
              <span>{breadcrumbs.length} breadcrumbs</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal-lighter">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber/60 to-amber"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTools.length / 5) * 100}%` }}
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
                  <div className={`p-5 ${deleting === inst.id ? "opacity-40 pointer-events-none" : ""}`}>
                    {renderer ? renderer(inst.input_data) : (
                      <p className="text-sm text-muted">Unknown tool type.</p>
                    )}
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
