"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField } from "@/components/tools/form-fields";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};
const COLORS = ["#d47c2f", "#34d399", "#60a5fa", "#a78bfa", "#f87171"];

function AcquisitionOutput({ formData }: { formData: Record<string, any> }) {
  const channels = [
    { key: "organic", name: "Organic / SEO", spend: parseFloat(formData.organic_spend) || 0, customers: parseFloat(formData.organic_customers) || 0 },
    { key: "paid", name: "Paid Ads", spend: parseFloat(formData.paid_spend) || 0, customers: parseFloat(formData.paid_customers) || 0 },
    { key: "social", name: "Social Media", spend: parseFloat(formData.social_spend) || 0, customers: parseFloat(formData.social_customers) || 0 },
    { key: "referral", name: "Referral", spend: parseFloat(formData.referral_spend) || 0, customers: parseFloat(formData.referral_customers) || 0 },
    { key: "other", name: "Other", spend: parseFloat(formData.other_channel_spend) || 0, customers: parseFloat(formData.other_channel_customers) || 0 },
  ].filter((c) => c.spend > 0 || c.customers > 0);

  const ltv = parseFloat(formData.customer_ltv) || 0;
  const conversionRate = parseFloat(formData.website_conversion_rate) || 0;

  if (channels.length === 0) {
    return <p className="text-sm text-muted">Fill in at least one channel above to see your acquisition analysis.</p>;
  }

  const totalSpend = channels.reduce((s, c) => s + c.spend, 0);
  const totalCustomers = channels.reduce((s, c) => s + c.customers, 0);
  const blendedCac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
  const ltvCacRatio = blendedCac > 0 && ltv > 0 ? ltv / blendedCac : 0;

  const channelData = channels.map((c, i) => ({
    name: c.name,
    cac: c.customers > 0 ? Math.round(c.spend / c.customers) : 0,
    customers: c.customers,
    spend: c.spend,
    roi: c.customers > 0 && ltv > 0 ? Math.round(((c.customers * ltv - c.spend) / c.spend) * 100) : 0,
    fill: COLORS[i % COLORS.length],
  }));

  const spendData = channels.map((c, i) => ({
    name: c.name,
    value: c.spend,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Blended CAC</p>
          <p className="mt-1 font-display text-xl font-bold text-amber">${blendedCac.toFixed(0)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Total Customers / Month</p>
          <p className="mt-1 font-display text-xl font-bold text-cream">{totalCustomers}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Monthly Ad Spend</p>
          <p className="mt-1 font-display text-xl font-bold text-red-400">${totalSpend.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">LTV:CAC Ratio</p>
          <p className={`mt-1 font-display text-xl font-bold ${ltvCacRatio >= 3 ? "text-green-400" : ltvCacRatio >= 1 ? "text-amber" : "text-red-400"}`}>
            {ltvCacRatio > 0 ? `${ltvCacRatio.toFixed(1)}x` : "—"}
          </p>
        </div>
      </div>

      {ltvCacRatio > 0 && ltvCacRatio < 3 && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">
          LTV:CAC ratio below 3x — your acquisition costs may not be sustainable long-term. A healthy ratio is 3x or higher.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted">CAC by Channel</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#a09880" fontSize={10} />
                <YAxis stroke="#a09880" fontSize={11} />
                <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${v}`} />
                <Bar dataKey="cac" name="CAC" radius={[4, 4, 0, 0]}>
                  {channelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Spend Allocation</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                  {spendData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {spendData.map((e, i) => (
              <span key={e.name} className="flex items-center gap-1 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /> {e.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {ltv > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Channel ROI</p>
          <div className="space-y-2">
            {channelData.filter((c) => c.spend > 0).map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-charcoal-lighter px-4 py-2">
                <span className="text-sm text-cream">{c.name}</span>
                <span className={`text-sm font-bold ${c.roi > 100 ? "text-green-400" : c.roi > 0 ? "text-amber" : "text-red-400"}`}>
                  {c.roi}% ROI
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcquisitionPlannerPage() {
  return (
    <ToolLayout
      toolName="Customer Acquisition"
      toolSlug="acquisition_planner"
      description="Plan your customer acquisition strategy, compare channel CAC, and optimize your marketing spend."
      outputSection={AcquisitionOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <FormField label="Customer Lifetime Value (LTV)" value={formData.customer_ltv || ""} onChange={(v) => setField("customer_ltv", v)} type="number" prefix="$" placeholder="0" hint="Average revenue from one customer over their lifetime" />
          <FormField label="Website Conversion Rate" value={formData.website_conversion_rate || ""} onChange={(v) => setField("website_conversion_rate", v)} type="number" suffix="%" placeholder="2" hint="% of visitors who become customers" />

          <p className="text-xs font-medium text-amber">Organic / SEO</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Spend" value={formData.organic_spend || ""} onChange={(v) => setField("organic_spend", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Customers / Month" value={formData.organic_customers || ""} onChange={(v) => setField("organic_customers", v)} type="number" placeholder="0" />
          </div>

          <p className="text-xs font-medium text-amber">Paid Advertising</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Spend" value={formData.paid_spend || ""} onChange={(v) => setField("paid_spend", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Customers / Month" value={formData.paid_customers || ""} onChange={(v) => setField("paid_customers", v)} type="number" placeholder="0" />
          </div>

          <p className="text-xs font-medium text-amber">Social Media</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Spend" value={formData.social_spend || ""} onChange={(v) => setField("social_spend", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Customers / Month" value={formData.social_customers || ""} onChange={(v) => setField("social_customers", v)} type="number" placeholder="0" />
          </div>

          <p className="text-xs font-medium text-amber">Referral / Word of Mouth</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Spend" value={formData.referral_spend || ""} onChange={(v) => setField("referral_spend", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Customers / Month" value={formData.referral_customers || ""} onChange={(v) => setField("referral_customers", v)} type="number" placeholder="0" />
          </div>

          <p className="text-xs font-medium text-amber">Other Channels</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Spend" value={formData.other_channel_spend || ""} onChange={(v) => setField("other_channel_spend", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Customers / Month" value={formData.other_channel_customers || ""} onChange={(v) => setField("other_channel_customers", v)} type="number" placeholder="0" />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
