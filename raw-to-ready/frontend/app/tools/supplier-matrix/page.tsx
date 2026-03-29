"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, TextAreaField } from "@/components/tools/form-fields";
import { Star, ExternalLink, Copy, Check, Sparkles, Upload } from "lucide-react";

const CLAUDE_URL = "https://claude.ai/new";

interface Supplier {
  name: string;
  location: string;
  cost_per_unit: string;
  moq: string;
  lead_time: string;
  notes: string;
}

const emptySupplier: Supplier = {
  name: "",
  location: "",
  cost_per_unit: "",
  moq: "",
  lead_time: "",
  notes: "",
};

function SupplierOutput({ formData }: { formData: Record<string, any> }) {
  const suppliers: Supplier[] = formData.suppliers || [];
  const filled = suppliers.filter((s: Supplier) => s.name && s.cost_per_unit);

  if (filled.length === 0) {
    return (
      <p className="text-sm text-muted">
        Add at least one supplier above to see the comparison.
      </p>
    );
  }

  // Score each supplier (lower cost + lower lead time = better)
  const scored = filled.map((s: Supplier) => {
    const cost = parseFloat(s.cost_per_unit) || 999;
    const lead = parseFloat(s.lead_time) || 999;
    const moq = parseFloat(s.moq) || 999;
    const score = cost * 0.5 + lead * 0.3 + moq * 0.001;
    return { ...s, score };
  });
  scored.sort((a, b) => a.score - b.score);
  const bestName = scored[0]?.name;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="pb-2 text-xs font-medium text-muted">Supplier</th>
            <th className="pb-2 text-xs font-medium text-muted">Location</th>
            <th className="pb-2 text-xs font-medium text-muted">Cost/Unit</th>
            <th className="pb-2 text-xs font-medium text-muted">MOQ</th>
            <th className="pb-2 text-xs font-medium text-muted">Lead Time</th>
            <th className="pb-2 text-xs font-medium text-muted">Notes</th>
          </tr>
        </thead>
        <tbody>
          {scored.map((s, i) => (
            <tr
              key={i}
              className={`border-b border-white/[0.04] ${
                s.name === bestName
                  ? "bg-amber/5"
                  : ""
              }`}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {s.name === bestName && (
                    <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                  )}
                  <span className={s.name === bestName ? "font-semibold text-amber" : "text-cream"}>
                    {s.name}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 text-muted">{s.location || "—"}</td>
              <td className="py-3 pr-4 text-cream">${s.cost_per_unit}</td>
              <td className="py-3 pr-4 text-muted">{s.moq || "—"}</td>
              <td className="py-3 pr-4 text-muted">
                {s.lead_time ? `${s.lead_time} days` : "—"}
              </td>
              <td className="py-3 text-muted/60 text-xs max-w-[120px] truncate">
                {s.notes || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bestName && (
        <p className="mt-4 text-sm text-amber">
          <Star className="mr-1 inline h-3.5 w-3.5 fill-amber" />
          Recommended: <strong>{bestName}</strong> — best combination of cost and lead time.
        </p>
      )}
    </div>
  );
}

function SupplierEntryCard({
  index,
  supplier,
  onChange,
}: {
  index: number;
  supplier: Supplier;
  onChange: (s: Supplier) => void;
}) {
  const update = (field: keyof Supplier, value: string) =>
    onChange({ ...supplier, [field]: value });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-charcoal-lighter p-4">
      <p className="mb-3 text-xs font-medium text-muted">
        Supplier {index + 1}
      </p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Name"
            value={supplier.name}
            onChange={(v) => update("name", v)}
            placeholder="Supplier name"
          />
          <FormField
            label="Location"
            value={supplier.location}
            onChange={(v) => update("location", v)}
            placeholder="City, Country"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField
            label="Cost Per Unit"
            value={supplier.cost_per_unit}
            onChange={(v) => update("cost_per_unit", v)}
            type="number"
            prefix="$"
          />
          <FormField
            label="MOQ"
            value={supplier.moq}
            onChange={(v) => update("moq", v)}
            type="number"
            placeholder="Min order qty"
          />
          <FormField
            label="Lead Time (days)"
            value={supplier.lead_time}
            onChange={(v) => update("lead_time", v)}
            type="number"
          />
        </div>
        <TextAreaField
          label="Notes"
          value={supplier.notes}
          onChange={(v) => update("notes", v)}
          placeholder="Quality, certifications, relationship notes..."
          rows={2}
        />
      </div>
    </div>
  );
}

export default function SupplierMatrixPage() {
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  return (
    <ToolLayout
      toolName="Supplier Comparison Matrix"
      toolSlug="supplier_matrix"
      description="Compare up to 4 suppliers side-by-side on cost, MOQ, lead time, and more."
      outputSection={SupplierOutput}
    >
      {({ formData, setField }) => {
        const productDesc = formData.product_description || "";

        const prompt = `I need to find suppliers for my business.${productDesc ? ` Here's what I need: ${productDesc}` : ""}

Please suggest 4 real or realistic suppliers for my product/materials. Return EXACTLY this format — no extra text:

[Supplier 1]
Name: SupplierName
Location: City, Country
Cost Per Unit: 12.50
MOQ: 500
Lead Time: 14
Notes: Brief quality/certification notes

[Supplier 2]
Name: SupplierName
Location: City, Country
Cost Per Unit: 10.00
MOQ: 1000
Lead Time: 21
Notes: Brief notes

[Supplier 3]
Name: SupplierName
Location: City, Country
Cost Per Unit: 15.00
MOQ: 200
Lead Time: 7
Notes: Brief notes

[Supplier 4]
Name: SupplierName
Location: City, Country
Cost Per Unit: 8.50
MOQ: 2000
Lead Time: 30
Notes: Brief notes

Use real supplier names where possible. Cost Per Unit should be numbers only (no $). Lead Time should be in days (numbers only). Be specific to my industry.`;

        const handleCopyPrompt = async () => {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        const handleImport = () => {
          const suppliers: Supplier[] = [];
          const sections = importText.split(/\[Supplier\s*\d+\]/gi);

          for (const section of sections) {
            if (!section.trim()) continue;
            const s: Supplier = { ...emptySupplier };
            for (const line of section.split("\n")) {
              const match = line.match(/^\s*(Name|Location|Cost Per Unit|MOQ|Lead Time|Notes)\s*:\s*(.+)/i);
              if (match) {
                const key = match[1].toLowerCase();
                const val = match[2].trim();
                if (key === "name") s.name = val;
                else if (key === "location") s.location = val;
                else if (key === "cost per unit") s.cost_per_unit = val.replace(/[^0-9.]/g, "");
                else if (key === "moq") s.moq = val.replace(/[^0-9]/g, "");
                else if (key === "lead time") s.lead_time = val.replace(/[^0-9]/g, "");
                else if (key === "notes") s.notes = val;
              }
            }
            if (s.name) suppliers.push(s);
          }

          if (suppliers.length === 0) {
            setImportError("Couldn't parse any suppliers. Make sure the output uses [Supplier N] sections.");
            return;
          }

          while (suppliers.length < 4) suppliers.push({ ...emptySupplier });
          setImportError("");
          setField("suppliers", suppliers.slice(0, 4));
          setShowImport(false);
          setImportText("");
        };

        const suppliers: Supplier[] = formData.suppliers || [
          { ...emptySupplier },
          { ...emptySupplier },
          { ...emptySupplier },
          { ...emptySupplier },
        ];

        const updateSupplier = (index: number, s: Supplier) => {
          const updated = [...suppliers];
          updated[index] = s;
          setField("suppliers", updated);
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
                Let Claude find real suppliers for your product — with pricing, MOQs, and lead times.
              </p>
              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-muted">What do you need supplied?</label>
                <textarea value={productDesc} onChange={(e) => setField("product_description", e.target.value)} placeholder="e.g. Raw pine lumber for handmade furniture, organic cotton fabric for clothing line..." rows={2} className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
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
                  <textarea value={importText} onChange={(e) => { setImportText(e.target.value); setImportError(""); }} rows={8} placeholder="Paste here..." className="w-full rounded-lg border border-white/[0.06] bg-charcoal-lighter px-3 py-2 text-xs text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                  {importError && <p className="text-xs text-red-400">{importError}</p>}
                  <button onClick={handleImport} disabled={!importText.trim()} className="rounded-lg bg-amber px-4 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-40">Import & Populate Suppliers</button>
                </div>
              )}
            </div>

            {suppliers.map((s, i) => (
              <SupplierEntryCard
                key={i}
                index={i}
                supplier={s}
                onChange={(updated) => updateSupplier(i, updated)}
              />
            ))}
          </div>
        );
      }}
    </ToolLayout>
  );
}
