"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";

function PricingOutput({ formData }: { formData: Record<string, any> }) {
  const cost = parseFloat(formData.cost_per_unit) || 0;
  const comp1 = parseFloat(formData.competitor_price_1) || 0;
  const comp2 = parseFloat(formData.competitor_price_2) || 0;
  const comp3 = parseFloat(formData.competitor_price_3) || 0;

  if (!cost) {
    return (
      <p className="text-sm text-muted">
        Fill in the fields above to see pricing recommendations.
      </p>
    );
  }

  const competitors = [comp1, comp2, comp3].filter((c) => c > 0);
  const avgCompetitor = competitors.length
    ? competitors.reduce((a, b) => a + b, 0) / competitors.length
    : 0;
  const minComp = competitors.length ? Math.min(...competitors) : 0;
  const maxComp = competitors.length ? Math.max(...competitors) : 0;

  // Pricing strategies
  const costPlus50 = cost * 1.5;
  const costPlus100 = cost * 2;
  const costPlus200 = cost * 3;

  const pricePoints = [
    { label: "Economy", price: costPlus50, margin: ((costPlus50 - cost) / costPlus50) * 100 },
    { label: "Standard", price: costPlus100, margin: ((costPlus100 - cost) / costPlus100) * 100 },
    { label: "Premium", price: costPlus200, margin: ((costPlus200 - cost) / costPlus200) * 100 },
  ];

  // Recommended range
  const low = Math.max(costPlus50, minComp * 0.9);
  const high = Math.max(costPlus100, maxComp * 1.1);

  return (
    <div className="space-y-6">
      {/* Recommended range */}
      <div className="rounded-lg border border-amber/20 bg-amber/5 p-4">
        <p className="text-xs font-medium text-amber">Recommended Price Range</p>
        <p className="mt-1 font-display text-2xl font-bold text-cream">
          ${low.toFixed(2)} — ${high.toFixed(2)}
        </p>
        {avgCompetitor > 0 && (
          <p className="mt-1 text-xs text-muted">
            Competitor average: ${avgCompetitor.toFixed(2)}
          </p>
        )}
      </div>

      {/* Price points comparison */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted">Margin at Each Price Point</p>
        {pricePoints.map((pp) => (
          <div
            key={pp.label}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-charcoal-lighter p-3"
          >
            <div>
              <p className="text-sm font-medium text-cream">{pp.label}</p>
              <p className="text-xs text-muted">${pp.price.toFixed(2)} per unit</p>
            </div>
            <div className="text-right">
              <p
                className={`font-display text-lg font-bold ${
                  pp.margin > 60
                    ? "text-green-400"
                    : pp.margin > 30
                    ? "text-amber"
                    : "text-red-400"
                }`}
              >
                {pp.margin.toFixed(1)}%
              </p>
              <p className="text-xs text-muted">
                ${(pp.price - cost).toFixed(2)} profit
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingCalculatorPage() {
  return (
    <ToolLayout
      toolName="Pricing Strategy Tool"
      toolSlug="pricing_calculator"
      description="Find the optimal price for your product based on costs, competitors, and value."
      outputSection={PricingOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-4">
          <FormField
            label="Cost Per Unit"
            value={formData.cost_per_unit || ""}
            onChange={(v) => setField("cost_per_unit", v)}
            type="number"
            prefix="$"
            placeholder="0.00"
          />
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Competitor Price 1"
              value={formData.competitor_price_1 || ""}
              onChange={(v) => setField("competitor_price_1", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
            <FormField
              label="Competitor Price 2"
              value={formData.competitor_price_2 || ""}
              onChange={(v) => setField("competitor_price_2", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
            <FormField
              label="Competitor Price 3"
              value={formData.competitor_price_3 || ""}
              onChange={(v) => setField("competitor_price_3", v)}
              type="number"
              prefix="$"
              placeholder="0.00"
            />
          </div>
          <TextAreaField
            label="Perceived Value Notes"
            value={formData.perceived_value || ""}
            onChange={(v) => setField("perceived_value", v)}
            placeholder="What makes your product unique? Handmade, organic, premium materials, local sourcing..."
          />
          <SelectField
            label="Pricing Model"
            value={formData.pricing_model || ""}
            onChange={(v) => setField("pricing_model", v)}
            options={[
              { value: "one-time", label: "One-time purchase" },
              { value: "subscription", label: "Subscription / Recurring" },
              { value: "tiered", label: "Tiered pricing" },
            ]}
          />
        </div>
      )}
    </ToolLayout>
  );
}
