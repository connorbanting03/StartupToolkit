"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";
import { Sparkles, ExternalLink, Copy, Check, Upload } from "lucide-react";
import { AiAutofillButton } from "@/components/tools/ai-autofill-button";

const CLAUDE_URL = "https://claude.ai/new";

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
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  return (
    <ToolLayout
      toolName="Pricing Strategy Tool"
      toolSlug="pricing_calculator"
      description="Find the optimal price for your product based on costs, competitors, and value."
      outputSection={PricingOutput}
    >
      {({ formData, setField }) => {
        const businessName = formData.business_name || "";
        const businessDesc = formData.business_description || "";

        const prompt = `I need help pricing my product${businessName ? ` for ${businessName}` : ""}.${businessDesc ? ` ${businessDesc}` : ""}

Please research realistic pricing data and return EXACTLY this format — no extra text:

cost_per_unit: 12.50
competitor_price_1: 19.99
competitor_price_2: 24.99
competitor_price_3: 15.99
perceived_value: Premium quality, handmade craftsmanship, sustainable materials, local sourcing
pricing_model: one-time

Use realistic market prices for my type of product. cost_per_unit should reflect actual production/sourcing costs. competitor_price_1/2/3 should be real competitor prices or realistic estimates. perceived_value should list 3-5 differentiators. pricing_model must be one of: one-time, subscription, tiered.`;

        const handleCopyPrompt = async () => {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        const handleImport = (override?: string) => {
          const text = typeof override === "string" ? override : importText;
          const parsed: Record<string, string> = {};
          for (const line of text.split("\n")) {
            const match = line.match(/^\s*(cost_per_unit|competitor_price_1|competitor_price_2|competitor_price_3|perceived_value|pricing_model)\s*:\s*(.+)/i);
            if (match) {
              parsed[match[1].toLowerCase()] = match[2].trim();
            }
          }

          if (Object.keys(parsed).length === 0) {
            setImportError("Couldn't parse the response. Make sure it uses field_name: value format.");
            return;
          }

          setImportError("");
          const numericFields = ["cost_per_unit", "competitor_price_1", "competitor_price_2", "competitor_price_3"];
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
              Describe your product and let Claude research competitor pricing and cost estimates.
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input value={businessName} onChange={(e) => setField("business_name", e.target.value)} placeholder="Business name" className="rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
              <input value={businessDesc} onChange={(e) => setField("business_description", e.target.value)} placeholder="Product description" className="rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
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
                <button onClick={() => handleImport()} disabled={!importText.trim()} className="rounded-lg bg-amber px-4 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-40">Import & Fill Fields</button>
              </div>
            )}
          </div>

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
        );
      }}
    </ToolLayout>
  );
}
