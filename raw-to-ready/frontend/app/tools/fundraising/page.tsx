"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";
import { Sparkles, ExternalLink, Copy, Check, Upload } from "lucide-react";

const CLAUDE_URL = "https://claude.ai/new";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

function FundraisingOutput({ formData }: { formData: Record<string, any> }) {
  const currentCash = parseFloat(formData.current_cash) || 0;
  const monthlyBurn = parseFloat(formData.monthly_burn) || 0;
  const monthlyRevenue = parseFloat(formData.monthly_revenue) || 0;
  const targetRaise = parseFloat(formData.target_raise) || 0;
  const preMoneyVal = parseFloat(formData.pre_money_valuation) || 0;
  const burnGrowth = parseFloat(formData.burn_growth_rate) || 0;
  const revenueGrowth = parseFloat(formData.revenue_growth_rate) || 0;

  if (!currentCash && !monthlyBurn) {
    return <p className="text-sm text-muted">Fill in the fields above to see your runway analysis.</p>;
  }

  const netBurn = monthlyBurn - monthlyRevenue;
  const currentRunway = netBurn > 0 ? Math.floor(currentCash / netBurn) : 999;
  const postRaiseCash = currentCash + targetRaise;
  const dilution = preMoneyVal > 0 ? (targetRaise / (preMoneyVal + targetRaise)) * 100 : 0;
  const postMoneyVal = preMoneyVal + targetRaise;

  // Project cash balance over 24 months, with & without raise
  const months: any[] = [];
  let balanceNoRaise = currentCash;
  let balanceWithRaise = postRaiseCash;
  let runwayNoRaise: number | null = null;
  let runwayWithRaise: number | null = null;

  for (let i = 1; i <= 24; i++) {
    const burnMultiplier = Math.pow(1 + burnGrowth / 100, i - 1);
    const revMultiplier = Math.pow(1 + revenueGrowth / 100, i - 1);
    const burn = monthlyBurn * burnMultiplier;
    const rev = monthlyRevenue * revMultiplier;
    const net = burn - rev;

    balanceNoRaise -= net;
    balanceWithRaise -= net;

    if (runwayNoRaise === null && balanceNoRaise <= 0) runwayNoRaise = i;
    if (runwayWithRaise === null && balanceWithRaise <= 0) runwayWithRaise = i;

    months.push({
      month: `M${i}`,
      withoutRaise: Math.round(Math.max(balanceNoRaise, -currentCash)),
      withRaise: targetRaise > 0 ? Math.round(Math.max(balanceWithRaise, -postRaiseCash)) : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Current Runway</p>
          <p className={`mt-1 font-display text-xl font-bold ${currentRunway < 6 ? "text-red-400" : currentRunway < 12 ? "text-amber" : "text-green-400"}`}>
            {currentRunway >= 999 ? "∞" : `${currentRunway} mo`}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
          <p className="text-xs text-muted">Net Monthly Burn</p>
          <p className="mt-1 font-display text-xl font-bold text-red-400">${netBurn.toLocaleString()}</p>
        </div>
        {targetRaise > 0 && (
          <>
            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs text-muted">Post-Raise Runway</p>
              <p className="mt-1 font-display text-xl font-bold text-green-400">
                {runwayWithRaise ? `${runwayWithRaise} mo` : "24+ mo"}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
              <p className="text-xs text-muted">Dilution</p>
              <p className="mt-1 font-display text-xl font-bold text-amber">{dilution.toFixed(1)}%</p>
            </div>
          </>
        )}
      </div>

      {targetRaise > 0 && preMoneyVal > 0 && (
        <div className="rounded-lg border border-amber/20 bg-amber/5 p-4">
          <p className="text-xs font-medium text-amber">Equity Summary</p>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-muted">Pre-Money</p><p className="font-bold text-cream">${preMoneyVal.toLocaleString()}</p></div>
            <div><p className="text-muted">Post-Money</p><p className="font-bold text-cream">${postMoneyVal.toLocaleString()}</p></div>
            <div><p className="text-muted">Investor Ownership</p><p className="font-bold text-cream">{dilution.toFixed(1)}%</p></div>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Cash Balance Projection (24 months)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" stroke="#a09880" fontSize={11} />
              <YAxis stroke="#a09880" fontSize={11} />
              <Tooltip contentStyle={CHART_STYLES} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <ReferenceLine y={0} stroke="#555" />
              <Area type="monotone" dataKey="withoutRaise" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Without Raise" />
              {targetRaise > 0 && (
                <Area type="monotone" dataKey="withRaise" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} name="With Raise" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function FundraisingPage() {
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  return (
    <ToolLayout
      toolName="Fundraising & Runway"
      toolSlug="fundraising"
      description="Calculate your runway, model funding rounds, and understand dilution."
      outputSection={FundraisingOutput}
    >
      {({ formData, setField }) => {
        const businessName = formData.business_name || "";
        const businessDesc = formData.business_description || "";

        const prompt = `I'm planning fundraising for ${businessName || "my startup"}.${businessDesc ? ` ${businessDesc}` : ""}

Please estimate realistic financial figures for my startup. Return EXACTLY this format — no extra text:

current_cash: 50000
monthly_burn: 12000
monthly_revenue: 3000
revenue_growth_rate: 8
burn_growth_rate: 3
round_type: seed
target_raise: 500000
pre_money_valuation: 2500000
use_of_funds: 40% product development, 25% marketing and customer acquisition, 20% hiring key roles, 15% operations and overhead

Give realistic numbers based on the stage and type of business described. round_type must be one of: pre_seed, seed, series_a, series_b, angel, convertible. Revenue growth and burn growth are monthly percentages. use_of_funds should be a clear breakdown.`;

        const handleCopyPrompt = async () => {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        const handleImport = () => {
          const parsed: Record<string, string> = {};
          for (const line of importText.split("\n")) {
            const match = line.match(/^\s*(current_cash|monthly_burn|monthly_revenue|revenue_growth_rate|burn_growth_rate|round_type|target_raise|pre_money_valuation|use_of_funds)\s*:\s*(.+)/i);
            if (match) {
              parsed[match[1].toLowerCase()] = match[2].trim();
            }
          }

          if (Object.keys(parsed).length === 0) {
            setImportError("Couldn't parse the response. Make sure it uses field_name: value format.");
            return;
          }

          setImportError("");
          const numericFields = ["current_cash", "monthly_burn", "monthly_revenue", "revenue_growth_rate", "burn_growth_rate", "target_raise", "pre_money_valuation"];
          for (const [key, val] of Object.entries(parsed)) {
            if (numericFields.includes(key)) {
              setField(key, val.replace(/[^0-9.]/g, ""));
            } else {
              setField(key, val);
            }
          }
          setShowImport(false);
          setImportText("");
        };

        return (
        <div className="space-y-4">
          {/* Claude Integration Banner */}
          <div className="rounded-xl border border-amber/20 bg-amber/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber" />
              <p className="text-sm font-medium text-cream">Auto-fill with Claude</p>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted">
              Describe your startup and let Claude estimate realistic financial figures and fundraising parameters.
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input value={businessName} onChange={(e) => setField("business_name", e.target.value)} placeholder="Business name" className="rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
              <input value={businessDesc} onChange={(e) => setField("business_description", e.target.value)} placeholder="Brief description" className="rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
            </div>
            <div className="mb-3 max-h-32 overflow-y-auto rounded-lg border border-white/[0.06] bg-charcoal p-3">
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted/70">{prompt}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleCopyPrompt} className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-charcoal px-3 py-1.5 text-xs font-medium text-cream transition hover:border-amber/30">
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy Prompt"}
              </button>
              <a href={CLAUDE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-amber px-3 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90">
                Open Claude <ExternalLink className="h-3 w-3" />
              </a>
              <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-1.5 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-medium text-amber transition hover:bg-amber/10">
                <Upload className="h-3 w-3" /> Import Response
              </button>
            </div>
            {showImport && (
              <div className="mt-3 space-y-2 rounded-lg border border-white/[0.06] bg-charcoal p-3">
                <p className="text-xs text-muted">Paste Claude&apos;s response below:</p>
                <textarea value={importText} onChange={(e) => { setImportText(e.target.value); setImportError(""); }} rows={6} placeholder="Paste here..." className="w-full rounded-lg border border-white/[0.06] bg-charcoal-lighter px-3 py-2 text-xs text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                {importError && <p className="text-xs text-red-400">{importError}</p>}
                <button onClick={handleImport} disabled={!importText.trim()} className="rounded-lg bg-amber px-4 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-40">Import & Fill Fields</button>
              </div>
            )}
          </div>

          <p className="text-xs font-medium text-amber">Current Financials</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cash on Hand" value={formData.current_cash || ""} onChange={(v) => setField("current_cash", v)} type="number" prefix="$" placeholder="50000" />
            <FormField label="Monthly Burn Rate" value={formData.monthly_burn || ""} onChange={(v) => setField("monthly_burn", v)} type="number" prefix="$" placeholder="10000" hint="Total monthly expenses" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Revenue" value={formData.monthly_revenue || ""} onChange={(v) => setField("monthly_revenue", v)} type="number" prefix="$" placeholder="0" />
            <FormField label="Revenue Growth Rate" value={formData.revenue_growth_rate || ""} onChange={(v) => setField("revenue_growth_rate", v)} type="number" suffix="%" placeholder="5" hint="Monthly revenue growth" />
          </div>
          <FormField label="Burn Growth Rate" value={formData.burn_growth_rate || ""} onChange={(v) => setField("burn_growth_rate", v)} type="number" suffix="%" placeholder="2" hint="Monthly increase in expenses (hiring, scaling)" />

          <p className="text-xs font-medium text-amber">Funding Round</p>
          <SelectField
            label="Round Type"
            value={formData.round_type || ""}
            onChange={(v) => setField("round_type", v)}
            options={[
              { value: "pre_seed", label: "Pre-Seed" },
              { value: "seed", label: "Seed" },
              { value: "series_a", label: "Series A" },
              { value: "series_b", label: "Series B" },
              { value: "angel", label: "Angel Investment" },
              { value: "convertible", label: "Convertible Note / SAFE" },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Target Raise" value={formData.target_raise || ""} onChange={(v) => setField("target_raise", v)} type="number" prefix="$" placeholder="500000" />
            <FormField label="Pre-Money Valuation" value={formData.pre_money_valuation || ""} onChange={(v) => setField("pre_money_valuation", v)} type="number" prefix="$" placeholder="2000000" />
          </div>
          <TextAreaField
            label="Use of Funds"
            value={formData.use_of_funds || ""}
            onChange={(v) => setField("use_of_funds", v)}
            placeholder="e.g. 40% product development, 30% marketing, 20% hiring, 10% operations"
          />
        </div>
        );
      }}
    </ToolLayout>
  );
}
