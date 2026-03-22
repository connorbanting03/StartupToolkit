"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField } from "@/components/tools/form-fields";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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

const SEASONALITY_PRESETS: Record<string, number[]> = {
  none: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  retail: [0.8, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 1.0, 1.1, 1.1, 1.4, 1.5],
  summer: [0.7, 0.8, 0.9, 1.1, 1.3, 1.4, 1.4, 1.3, 1.0, 0.8, 0.7, 0.6],
  winter: [1.3, 1.2, 1.0, 0.8, 0.7, 0.6, 0.6, 0.7, 0.9, 1.1, 1.3, 1.4],
  b2b: [0.6, 0.9, 1.1, 1.1, 1.0, 0.9, 0.8, 0.8, 1.1, 1.2, 1.2, 0.7],
};

function RevenueOutput({ formData }: { formData: Record<string, any> }) {
  const revenueModel = formData.revenue_model || "one_time";
  const price = parseFloat(formData.price_per_unit) || 0;
  const units = parseFloat(formData.units_per_month) || 0;
  const cost = parseFloat(formData.cost_per_unit) || 0;
  const growth = parseFloat(formData.growth_rate) || 0;
  const projectionMonths = parseInt(formData.projection_months) || 12;
  const churnRate = parseFloat(formData.churn_rate) || 0;
  const discountRate = parseFloat(formData.discount_rate) || 0;
  const seasonality = formData.seasonality || "none";
  const seasonFactors = SEASONALITY_PRESETS[seasonality] || SEASONALITY_PRESETS.none;
  const paymentFreq = formData.payment_frequency || "monthly";

  if (!price || !units) {
    return (
      <p className="text-sm text-muted">
        Fill in the fields above to see your revenue projections.
      </p>
    );
  }

  const isSubscription = revenueModel === "subscription" || revenueModel === "hybrid";
  const months: any[] = [];
  let cumulativeProfit = 0;
  let breakEvenMonth: number | null = null;
  let activeSubscribers = 0;

  for (let i = 1; i <= projectionMonths; i++) {
    const growthMultiplier = Math.pow(1 + growth / 100, i - 1);
    const seasonFactor = seasonFactors[(i - 1) % 12];
    const newCustomers = Math.round(units * growthMultiplier * seasonFactor);

    let monthUnits: number;
    let customers: number;

    if (isSubscription) {
      // Subscription: new customers join, existing churn
      activeSubscribers = activeSubscribers * (1 - churnRate / 100) + newCustomers;
      customers = Math.round(activeSubscribers);
      monthUnits = customers;
    } else {
      customers = newCustomers;
      monthUnits = newCustomers;
    }

    const effectivePrice = price * (1 - discountRate / 100);
    // Annual payers: divide by 12 for monthly recognition but they pay upfront
    const revenue = monthUnits * effectivePrice;
    const costs = monthUnits * cost;
    const profit = revenue - costs;
    cumulativeProfit += profit;

    if (breakEvenMonth === null && cumulativeProfit > 0) {
      breakEvenMonth = i;
    }

    months.push({
      month: `M${i}`,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      customers,
    });
  }

  const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const totalProfit = months.reduce((sum, m) => sum + m.profit, 0);
  const lastMonth = months[months.length - 1];
  const mrr = lastMonth ? lastMonth.revenue : 0;
  const arr = mrr * 12;

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className={`grid gap-4 ${isSubscription ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Total Revenue ({projectionMonths}mo)</p>
          <p className="mt-1 font-display text-xl font-bold text-cream">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Total Profit ({projectionMonths}mo)</p>
          <p className="mt-1 font-display text-xl font-bold text-green-400">
            ${totalProfit.toLocaleString()}
          </p>
        </div>
        {isSubscription && (
          <>
            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs text-muted">MRR (Month {projectionMonths})</p>
              <p className="mt-1 font-display text-xl font-bold text-amber">
                ${mrr.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs text-muted">ARR (Month {projectionMonths})</p>
              <p className="mt-1 font-display text-xl font-bold text-amber">
                ${arr.toLocaleString()}
              </p>
            </div>
          </>
        )}
        {!isSubscription && (
          <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
            <p className="text-xs text-muted">Break-Even Month</p>
            <p className="mt-1 font-display text-xl font-bold text-amber">
              {breakEvenMonth ? `Month ${breakEvenMonth}` : "N/A"}
            </p>
          </div>
        )}
      </div>

      {/* Revenue & Profit Chart */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Revenue & Profit Over Time</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" stroke="#a09880" fontSize={12} />
              <YAxis stroke="#a09880" fontSize={12} />
              <Tooltip contentStyle={CHART_STYLES} />
              <Area type="monotone" dataKey="revenue" stroke="#d47c2f" fill="#d47c2f" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="costs" stroke="#ef4444" fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber" /> Revenue</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /> Profit</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Costs</span>
        </div>
      </div>

      {/* Customer count chart for subscription */}
      {isSubscription && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Active Subscribers Over Time</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#a09880" fontSize={12} />
                <YAxis stroke="#a09880" fontSize={12} />
                <Tooltip contentStyle={CHART_STYLES} />
                <Bar dataKey="customers" fill="#d47c2f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RevenueProjectorPage() {
  return (
    <ToolLayout
      toolName="Revenue Projector"
      toolSlug="revenue_projector"
      description="Project your monthly and annual revenue with growth modeling."
      outputSection={RevenueOutput}
    >
      {({ formData, setField }) => {
        const model = formData.revenue_model || "one_time";
        const isSub = model === "subscription" || model === "hybrid";
        return (
          <div className="space-y-4">
            <FormField
              label="Product / Service Name"
              value={formData.product_name || ""}
              onChange={(v) => setField("product_name", v)}
              placeholder="e.g. Handmade Lumber Shelves"
            />

            <SelectField
              label="Revenue Model"
              value={formData.revenue_model || "one_time"}
              onChange={(v) => setField("revenue_model", v)}
              options={[
                { value: "one_time", label: "One-Time Purchase" },
                { value: "subscription", label: "Subscription / Recurring" },
                { value: "hybrid", label: "Hybrid (Subscription + One-Time)" },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={isSub ? "Monthly Price" : "Price Per Unit"}
                value={formData.price_per_unit || ""}
                onChange={(v) => setField("price_per_unit", v)}
                type="number"
                prefix="$"
                placeholder="0.00"
              />
              <FormField
                label={isSub ? "New Customers / Month" : "Units Sold Per Month"}
                value={formData.units_per_month || ""}
                onChange={(v) => setField("units_per_month", v)}
                type="number"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={isSub ? "Cost Per Customer / Month" : "Cost Per Unit"}
                value={formData.cost_per_unit || ""}
                onChange={(v) => setField("cost_per_unit", v)}
                type="number"
                prefix="$"
                placeholder="0.00"
              />
              <FormField
                label="Monthly Growth Rate"
                value={formData.growth_rate || ""}
                onChange={(v) => setField("growth_rate", v)}
                type="number"
                suffix="%"
                placeholder="5"
                hint="Expected month-over-month growth"
              />
            </div>

            {isSub && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Monthly Churn Rate"
                  value={formData.churn_rate || ""}
                  onChange={(v) => setField("churn_rate", v)}
                  type="number"
                  suffix="%"
                  placeholder="5"
                  hint="% of subscribers lost each month"
                />
                <SelectField
                  label="Payment Frequency"
                  value={formData.payment_frequency || "monthly"}
                  onChange={(v) => setField("payment_frequency", v)}
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "annual", label: "Annual" },
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Discount / Promo Rate"
                value={formData.discount_rate || ""}
                onChange={(v) => setField("discount_rate", v)}
                type="number"
                suffix="%"
                placeholder="0"
                hint="Average discount off list price"
              />
              <SelectField
                label="Seasonality Pattern"
                value={formData.seasonality || "none"}
                onChange={(v) => setField("seasonality", v)}
                options={[
                  { value: "none", label: "No Seasonality" },
                  { value: "retail", label: "Retail (Holiday Peak)" },
                  { value: "summer", label: "Summer Peak" },
                  { value: "winter", label: "Winter Peak" },
                  { value: "b2b", label: "B2B (Q1/Q4 Heavy)" },
                ]}
              />
            </div>

            <SelectField
              label="Customer Acquisition Channel"
              value={formData.acquisition_channel || ""}
              onChange={(v) => setField("acquisition_channel", v)}
              options={[
                { value: "organic", label: "Organic / Word of Mouth" },
                { value: "paid", label: "Paid Advertising" },
                { value: "referral", label: "Referral Program" },
                { value: "content", label: "Content Marketing / SEO" },
                { value: "partnerships", label: "Partnerships / B2B" },
                { value: "mixed", label: "Mixed Channels" },
              ]}
            />

            <FormField
              label="Projection Length"
              value={formData.projection_months || "12"}
              onChange={(v) => setField("projection_months", v)}
              type="number"
              suffix="mo"
              placeholder="12"
              min={1}
              max={60}
              hint="How many months to project (1–60)"
            />
          </div>
        );
      }}
    </ToolLayout>
  );
}
