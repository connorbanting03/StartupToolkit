"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";
import { ExternalLink, Copy, Check, Sparkles, Upload } from "lucide-react";
import { AiAutofillButton } from "@/components/tools/ai-autofill-button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CLAUDE_URL = "https://claude.ai/new";

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

function generatePrompt(businessName: string, businessDesc: string): string {
  return `I'm doing market sizing for my business${businessName ? ` called "${businessName}"` : ""}.${businessDesc ? ` Here's what we do: ${businessDesc}` : ""}

Please estimate my market size and return EXACTLY this format — no extra text before or after:

target_market: [2-3 sentence description of my target market]
tam: [Total Addressable Market in dollars, numbers only e.g. 5000000000]
total_customers_in_market: [estimated total potential customers, numbers only]
avg_revenue_per_customer: [average annual revenue per customer in dollars, numbers only]
sam_percent: [what % of TAM I can realistically serve, numbers only e.g. 25]
som_percent: [what % of SAM I can capture in 1-3 years, numbers only e.g. 8]

Be specific to my industry and business type. Use real market data where possible. Only return the formatted data.`;
}

function parseClaudeOutput(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const fieldMap: Record<string, string> = {
    target_market: "target_market",
    tam: "tam",
    total_customers_in_market: "total_customers_in_market",
    avg_revenue_per_customer: "avg_revenue_per_customer",
    sam_percent: "sam_percent",
    som_percent: "som_percent",
  };

  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([\w_]+)\s*:\s*(.+)/);
    if (match) {
      const key = match[1].toLowerCase();
      let value = match[2].trim();
      if (fieldMap[key]) {
        if (key !== "target_market") {
          value = value.replace(/[^0-9.]/g, "");
        }
        result[fieldMap[key]] = value;
      }
    }
  }

  return result;
}

export default function MarketSizingPage() {
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  return (
    <ToolLayout
      toolName="Market Sizing"
      toolSlug="market_sizing"
      description="Estimate your Total Addressable Market (TAM), Serviceable Market (SAM), and Obtainable Market (SOM)."
      outputSection={MarketOutput}
    >
      {({ formData, setField }) => {
        const businessName = formData.business_name || "";
        const businessDesc = formData.business_description || "";
        const prompt = generatePrompt(businessName, businessDesc);

        const handleCopyPrompt = async () => {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        const handleImport = (override?: string) => {
          const text = typeof override === "string" ? override : importText;
          const parsed = parseClaudeOutput(text);
          if (Object.keys(parsed).length === 0) {
            setImportError("Couldn't parse any fields. Make sure the output uses field_name: value format.");
            return;
          }
          setImportError("");
          Object.entries(parsed).forEach(([key, val]) => setField(key, val));
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
                Let Claude estimate your TAM, SAM, and SOM based on real market data for your industry.
              </p>
              <div className="mb-3 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Business Name</label>
                  <input type="text" value={businessName} onChange={(e) => setField("business_name", e.target.value)} placeholder="e.g. My Startup" className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Brief Description</label>
                  <textarea value={businessDesc} onChange={(e) => setField("business_description", e.target.value)} placeholder="e.g. We sell premium organic coffee beans DTC in the US..." rows={2} className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                </div>
              </div>
              <div className="mb-3 max-h-32 overflow-y-auto rounded-lg border border-white/[0.06] bg-charcoal p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted/70">{prompt}</pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <AiAutofillButton prompt={prompt} onResult={(t) => { setShowImport(true); setImportText(t); handleImport(t); }} />
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
                  <button onClick={() => handleImport()} disabled={!importText.trim()} className="rounded-lg bg-amber px-4 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-40">Import & Populate</button>
                </div>
              )}
            </div>

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
        );
      }}
    </ToolLayout>
  );
}
