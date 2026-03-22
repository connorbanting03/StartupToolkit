"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField } from "@/components/tools/form-fields";

function UnitEconomicsOutput({ formData }: { formData: Record<string, any> }) {
  const cogs = parseFloat(formData.cogs) || 0;
  const price = parseFloat(formData.selling_price) || 0;
  const shipping = parseFloat(formData.shipping_cost) || 0;
  const returnRate = parseFloat(formData.return_rate) || 0;
  const cac = parseFloat(formData.cac) || 0;
  const ltvMonths = parseInt(formData.ltv_months) || 12;

  if (!price) {
    return (
      <p className="text-sm text-muted">
        Fill in the fields above to see your unit economics.
      </p>
    );
  }

  const totalCost = cogs + shipping;
  const grossProfit = price - totalCost;
  const grossMargin = price > 0 ? (grossProfit / price) * 100 : 0;
  const returnLoss = price * (returnRate / 100);
  const contributionMargin = grossProfit - returnLoss - cac;
  const contributionPct = price > 0 ? (contributionMargin / price) * 100 : 0;
  const estimatedLTV =
    contributionMargin > 0 ? contributionMargin * ltvMonths : contributionMargin;

  const metrics = [
    {
      label: "Gross Margin",
      value: `${grossMargin.toFixed(1)}%`,
      amount: `$${grossProfit.toFixed(2)} per unit`,
      color: grossMargin > 50 ? "text-green-400" : grossMargin > 20 ? "text-amber" : "text-red-400",
    },
    {
      label: "Contribution Margin",
      value: `${contributionPct.toFixed(1)}%`,
      amount: `$${contributionMargin.toFixed(2)} per unit`,
      color: contributionPct > 30 ? "text-green-400" : contributionPct > 0 ? "text-amber" : "text-red-400",
    },
    {
      label: `Est. LTV (${ltvMonths}mo)`,
      value: `$${estimatedLTV.toFixed(0)}`,
      amount: `Based on ${ltvMonths}-month retention`,
      color: estimatedLTV > 0 ? "text-green-400" : "text-red-400",
    },
  ];

  return (
    <div className="space-y-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4"
        >
          <div>
            <p className="text-xs text-muted">{m.label}</p>
            <p className="mt-0.5 text-xs text-muted/60">{m.amount}</p>
          </div>
          <p className={`font-display text-2xl font-bold ${m.color}`}>
            {m.value}
          </p>
        </div>
      ))}

      {/* Cost breakdown bar */}
      <div className="mt-4">
        <p className="mb-2 text-xs text-muted">Cost Breakdown per Unit</p>
        <div className="flex h-4 w-full overflow-hidden rounded-full">
          {totalCost > 0 && (
            <div
              className="bg-red-400/60"
              style={{ width: `${((cogs / price) * 100).toFixed(0)}%` }}
              title={`COGS: $${cogs}`}
            />
          )}
          {shipping > 0 && (
            <div
              className="bg-yellow-400/60"
              style={{ width: `${((shipping / price) * 100).toFixed(0)}%` }}
              title={`Shipping: $${shipping}`}
            />
          )}
          {returnLoss > 0 && (
            <div
              className="bg-orange-400/60"
              style={{ width: `${((returnLoss / price) * 100).toFixed(0)}%` }}
              title={`Returns: $${returnLoss.toFixed(2)}`}
            />
          )}
          {cac > 0 && (
            <div
              className="bg-purple-400/60"
              style={{ width: `${((cac / price) * 100).toFixed(0)}%` }}
              title={`CAC: $${cac}`}
            />
          )}
          <div className="flex-1 bg-green-400/40" title="Profit" />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400/60"/>COGS</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400/60"/>Shipping</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400/60"/>Returns</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-400/60"/>CAC</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400/40"/>Profit</span>
        </div>
      </div>
    </div>
  );
}

export default function UnitEconomicsPage() {
  return (
    <ToolLayout
      toolName="Unit Economics Calculator"
      toolSlug="unit_economics"
      description="Understand your per-unit profitability, margins, and customer lifetime value."
      outputSection={UnitEconomicsOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <FormField
            label="Product / Service Name"
            value={formData.product_name || ""}
            onChange={(v) => setField("product_name", v)}
            placeholder="e.g. Custom Wood Shelving Unit"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Cost of Goods Sold (COGS)"
              value={formData.cogs || ""}
              onChange={(v) => setField("cogs", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
            <FormField
              label="Selling Price"
              value={formData.selling_price || ""}
              onChange={(v) => setField("selling_price", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Shipping Cost"
              value={formData.shipping_cost || ""}
              onChange={(v) => setField("shipping_cost", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
            <FormField
              label="Return Rate"
              value={formData.return_rate || ""}
              onChange={(v) => setField("return_rate", v)}
              type="number"
              suffix="%"
              placeholder="5"
            />
            <FormField
              label="Customer Acquisition Cost"
              value={formData.cac || ""}
              onChange={(v) => setField("cac", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
          </div>
          <FormField
            label="LTV Projection Length"
            value={formData.ltv_months || "12"}
            onChange={(v) => setField("ltv_months", v)}
            type="number"
            suffix="mo"
            placeholder="12"
            min={1}
            max={60}
            hint="Months to project lifetime value (1–60)"
          />
        </div>
      )}
    </ToolLayout>
  );
}
