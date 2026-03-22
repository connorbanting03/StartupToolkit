"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

function MarketOutput({ formData }: { formData: Record<string, any> }) {
  const tam = parseFloat(formData.tam) || 0;
  const samPercent = parseFloat(formData.sam_percent) || 0;
  const somPercent = parseFloat(formData.som_percent) || 0;
  const avgRevPerCustomer = parseFloat(formData.avg_revenue_per_customer) || 0;
  const totalCustomersInMarket = parseFloat(formData.total_customers_in_market) || 0;

  // Allow either direct TAM input or calculated from customers × revenue
  const effectiveTam = tam > 0 ? tam : totalCustomersInMarket * avgRevPerCustomer;

  if (!effectiveTam) {
    return <p className="text-sm text-muted">Fill in the fields above to see your market sizing.</p>;
  }

  const sam = effectiveTam * (samPercent / 100);
  const som = sam * (somPercent / 100);

  const chartData = [
    { name: "TAM", value: Math.round(effectiveTam), fill: "#60a5fa" },
    { name: "SAM", value: Math.round(sam), fill: "#d47c2f" },
    { name: "SOM", value: Math.round(som), fill: "#34d399" },
  ];

  const formatNum = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-blue-400/20 bg-blue-400/5 p-4">
          <p className="text-xs text-muted">TAM (Total Addressable)</p>
          <p className="mt-1 font-display text-xl font-bold text-blue-400">{formatNum(effectiveTam)}</p>
          <p className="text-xs text-muted/60">Entire market opportunity</p>
        </div>
        <div className="rounded-lg border border-amber/20 bg-amber/5 p-4">
          <p className="text-xs text-muted">SAM (Serviceable)</p>
          <p className="mt-1 font-display text-xl font-bold text-amber">{formatNum(sam)}</p>
          <p className="text-xs text-muted/60">{samPercent}% of TAM you can reach</p>
        </div>
        <div className="rounded-lg border border-green-400/20 bg-green-400/5 p-4">
          <p className="text-xs text-muted">SOM (Obtainable)</p>
          <p className="mt-1 font-display text-xl font-bold text-green-400">{formatNum(som)}</p>
          <p className="text-xs text-muted/60">{somPercent}% of SAM you can capture</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Market Size Comparison</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" stroke="#a09880" fontSize={11} tickFormatter={(v) => formatNum(v)} />
              <YAxis type="category" dataKey="name" stroke="#a09880" fontSize={12} width={40} />
              <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => formatNum(Number(v))} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {avgRevPerCustomer > 0 && som > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs font-medium text-muted">Implied Customer Targets</p>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted">TAM Customers</p>
              <p className="font-bold text-cream">{Math.round(effectiveTam / avgRevPerCustomer).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">SAM Customers</p>
              <p className="font-bold text-cream">{Math.round(sam / avgRevPerCustomer).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted">SOM Customers</p>
              <p className="font-bold text-cream">{Math.round(som / avgRevPerCustomer).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import Cell for the bar chart
import { Cell } from "recharts";

export default function MarketSizingPage() {
  return (
    <ToolLayout
      toolName="Market Sizing"
      toolSlug="market_sizing"
      description="Estimate your Total Addressable Market (TAM), Serviceable Market (SAM), and Obtainable Market (SOM)."
      outputSection={MarketOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <SelectField
            label="Industry / Vertical"
            value={formData.industry || ""}
            onChange={(v) => setField("industry", v)}
            options={[
              { value: "ecommerce", label: "E-Commerce / Retail" },
              { value: "saas", label: "SaaS / Software" },
              { value: "services", label: "Services / Consulting" },
              { value: "food_bev", label: "Food & Beverage" },
              { value: "health", label: "Health & Wellness" },
              { value: "education", label: "Education" },
              { value: "manufacturing", label: "Manufacturing" },
              { value: "real_estate", label: "Real Estate" },
              { value: "other", label: "Other" },
            ]}
          />
          <TextAreaField
            label="Target Market Description"
            value={formData.target_market || ""}
            onChange={(v) => setField("target_market", v)}
            placeholder="Describe your target customer and market (e.g. small business owners in the US who need handmade furniture)"
          />

          <p className="text-xs font-medium text-amber">Market Size (enter TAM directly or calculate)</p>
          <FormField label="Total Addressable Market (TAM)" value={formData.tam || ""} onChange={(v) => setField("tam", v)} type="number" prefix="$" placeholder="0" hint="Total market revenue if you captured 100%" />
          <p className="text-center text-xs text-muted">— or calculate from —</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Customers in Market" value={formData.total_customers_in_market || ""} onChange={(v) => setField("total_customers_in_market", v)} type="number" placeholder="0" />
            <FormField label="Avg Revenue Per Customer / Year" value={formData.avg_revenue_per_customer || ""} onChange={(v) => setField("avg_revenue_per_customer", v)} type="number" prefix="$" placeholder="0" />
          </div>

          <p className="text-xs font-medium text-amber">Market Segmentation</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="SAM % of TAM" value={formData.sam_percent || ""} onChange={(v) => setField("sam_percent", v)} type="number" suffix="%" placeholder="30" hint="% of TAM your product can actually serve" />
            <FormField label="SOM % of SAM" value={formData.som_percent || ""} onChange={(v) => setField("som_percent", v)} type="number" suffix="%" placeholder="10" hint="% of SAM you can realistically capture in 1–3 years" />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
