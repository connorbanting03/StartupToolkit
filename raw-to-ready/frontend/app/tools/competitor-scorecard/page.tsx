"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField } from "@/components/tools/form-fields";
import { ExternalLink, Copy, Check, Sparkles, Upload } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const CLAUDE_URL = "https://claude.ai/new";

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};

function generatePrompt(companyName: string, companyDesc: string): string {
  return `I'm building a Competitor Scorecard for my business${companyName ? ` called "${companyName}"` : ""}.${companyDesc ? ` Here's what we do: ${companyDesc}` : ""}

Please identify my top 3 real competitors and rate all 4 companies (mine + 3 competitors) across 6 dimensions on a scale of 1-10. Return your answer in EXACTLY this format — no extra text before or after:

[Your Company]
Price: 7
Features: 6
UX: 8
Support: 5
Brand: 4
Speed: 7

[Competitor 1: CompetitorName]
Price: 8
Features: 9
UX: 7
Support: 6
Brand: 9
Speed: 5

[Competitor 2: CompetitorName]
Price: 6
Features: 7
UX: 8
Support: 8
Brand: 7
Speed: 6

[Competitor 3: CompetitorName]
Price: 9
Features: 5
UX: 6
Support: 7
Brand: 5
Speed: 8

Use real competitor names specific to my industry. Score honestly — don't inflate my scores. Only return the formatted scorecard.`;
}

function parseClaudeOutput(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const dimMap: Record<string, string> = {
    "price": "price",
    "features": "features",
    "ux": "ux",
    "support": "support",
    "brand": "brand",
    "speed": "speed",
  };

  const sections = text.split(/\[([^\]]+)\]/g);

  let sectionIndex = 0;
  for (let i = 1; i < sections.length; i += 2) {
    const header = sections[i].trim();
    const body = sections[i + 1] || "";

    let prefix: string;
    if (sectionIndex === 0) {
      prefix = "your";
    } else {
      prefix = `comp${sectionIndex}`;
      const nameMatch = header.match(/Competitor\s*\d+:\s*(.+)/i);
      if (nameMatch) {
        result[`${prefix}_name`] = nameMatch[1].trim();
      }
    }

    for (const line of body.split("\n")) {
      const match = line.match(/^\s*(Price|Features|UX|Support|Brand|Speed)\s*:\s*(\d+)/i);
      if (match) {
        const dimKey = dimMap[match[1].toLowerCase()];
        if (dimKey) {
          result[`${prefix}_${dimKey}`] = match[2];
        }
      }
    }
    sectionIndex++;
  }

  return result;
}

function CompetitorOutput({ formData }: { formData: Record<string, any> }) {
  const yourName = formData.your_company || "Your Company";
  const comp1 = formData.comp1_name || "";
  const comp2 = formData.comp2_name || "";
  const comp3 = formData.comp3_name || "";

  const dimensions = [
    { key: "price", label: "Price Competitiveness" },
    { key: "features", label: "Feature Set" },
    { key: "ux", label: "User Experience" },
    { key: "support", label: "Customer Support" },
    { key: "brand", label: "Brand Strength" },
    { key: "speed", label: "Speed to Market" },
  ];

  const companies = [
    { name: yourName, prefix: "your", color: "#d47c2f" },
    ...(comp1 ? [{ name: comp1, prefix: "comp1", color: "#60a5fa" }] : []),
    ...(comp2 ? [{ name: comp2, prefix: "comp2", color: "#34d399" }] : []),
    ...(comp3 ? [{ name: comp3, prefix: "comp3", color: "#a78bfa" }] : []),
  ];

  const hasScores = dimensions.some((d) => parseFloat(formData[`your_${d.key}`]) > 0);

  if (!hasScores) {
    return <p className="text-sm text-muted">Rate your company and competitors on the dimensions above to see the scorecard.</p>;
  }

  const radarData = dimensions.map((d) => {
    const entry: any = { dimension: d.label };
    companies.forEach((c) => {
      entry[c.name] = parseFloat(formData[`${c.prefix}_${d.key}`]) || 0;
    });
    return entry;
  });

  // Overall scores
  const companyScores = companies.map((c) => {
    const total = dimensions.reduce((s, d) => s + (parseFloat(formData[`${c.prefix}_${d.key}`]) || 0), 0);
    return { ...c, total, avg: total / dimensions.length };
  });

  const leader = companyScores.reduce((a, b) => (a.avg > b.avg ? a : b));

  // Find strengths & weaknesses (for your company)
  const yourDims = dimensions.map((d) => ({
    ...d,
    score: parseFloat(formData[`your_${d.key}`]) || 0,
  }));
  const strengths = yourDims.filter((d) => d.score >= 8).map((d) => d.label);
  const weaknesses = yourDims.filter((d) => d.score <= 4 && d.score > 0).map((d) => d.label);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {companyScores.map((c) => (
          <div key={c.name} className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-4">
            <p className="truncate text-xs text-muted">{c.name}</p>
            <p className="mt-1 font-display text-xl font-bold" style={{ color: c.color }}>
              {c.avg.toFixed(1)}/10
            </p>
            {c.name === leader.name && <span className="mt-1 inline-block rounded bg-amber/10 px-1.5 py-0.5 text-[10px] font-medium text-amber">Leader</span>}
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Competitive Radar</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#a09880", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#666", fontSize: 10 }} />
              {companies.map((c) => (
                <Radar key={c.name} name={c.name} dataKey={c.name} stroke={c.color} fill={c.color} fillOpacity={0.1} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: "#a09880" }} />
              <Tooltip contentStyle={CHART_STYLES} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <div className="rounded-lg border border-green-400/20 bg-green-400/5 p-4">
              <p className="mb-2 text-xs font-medium text-green-400">Your Strengths</p>
              <ul className="space-y-1">{strengths.map((s) => <li key={s} className="text-sm text-cream">• {s}</li>)}</ul>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4">
              <p className="mb-2 text-xs font-medium text-red-400">Areas to Improve</p>
              <ul className="space-y-1">{weaknesses.map((w) => <li key={w} className="text-sm text-cream">• {w}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreFields({ prefix, label, formData, setField }: { prefix: string; label: string; formData: Record<string, any>; setField: (key: string, val: any) => void }) {
  const dims = ["price", "features", "ux", "support", "brand", "speed"];
  const dimLabels = ["Price", "Features", "UX", "Support", "Brand", "Speed"];
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-amber">{label}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {dims.map((d, i) => (
          <FormField key={d} label={dimLabels[i]} value={formData[`${prefix}_${d}`] || ""} onChange={(v) => setField(`${prefix}_${d}`, v)} type="number" placeholder="0" hint="1-10" min={0} max={10} />
        ))}
      </div>
    </div>
  );
}

export default function CompetitorScorecardPage() {
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  return (
    <ToolLayout
      toolName="Competitor Scorecard"
      toolSlug="competitor_scorecard"
      description="Rate yourself and competitors across key dimensions to identify your competitive advantages."
      outputSection={CompetitorOutput}
    >
      {({ formData, setField }) => {
        const companyName = formData.your_company || "";
        const companyDesc = formData.company_description || "";
        const prompt = generatePrompt(companyName, companyDesc);

        const handleCopyPrompt = async () => {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        const handleImport = () => {
          const parsed = parseClaudeOutput(importText);
          const keys = Object.keys(parsed);
          if (keys.length === 0) {
            setImportError("Couldn't parse any scores. Make sure the output uses [Section] format with Score: N lines.");
            return;
          }
          setImportError("");
          keys.forEach((key) => setField(key, parsed[key]));
          setShowImport(false);
          setImportText("");
        };

        return (
          <div className="space-y-5">
            {/* Claude Integration Banner */}
            <div className="rounded-xl border border-amber/20 bg-amber/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber" />
                <p className="text-sm font-medium text-cream">Auto-fill with Claude</p>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-muted">
                Let Claude identify your top competitors and score everyone across all dimensions. Add your business info, copy the prompt, paste it in Claude, then import the response.
              </p>

              <div className="mb-3 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Business Name (for prompt)</label>
                  <input type="text" value={companyName} onChange={(e) => setField("your_company", e.target.value)} placeholder="e.g. My Startup" className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Brief Description (for prompt)</label>
                  <textarea value={companyDesc} onChange={(e) => setField("company_description", e.target.value)} placeholder="e.g. We sell handmade candles online and in local markets..." rows={2} className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                </div>
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
                  Open Claude
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-1.5 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-medium text-amber transition hover:bg-amber/10">
                  <Upload className="h-3 w-3" />
                  Import Response
                </button>
              </div>

              {showImport && (
                <div className="mt-3 space-y-2 rounded-lg border border-white/[0.06] bg-charcoal p-3">
                  <p className="text-xs text-muted">Paste Claude&apos;s response below and click Import:</p>
                  <textarea value={importText} onChange={(e) => { setImportText(e.target.value); setImportError(""); }} rows={8} placeholder="Paste the full Claude response here..." className="w-full rounded-lg border border-white/[0.06] bg-charcoal-lighter px-3 py-2 text-xs text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none" />
                  {importError && <p className="text-xs text-red-400">{importError}</p>}
                  <button onClick={handleImport} disabled={!importText.trim()} className="rounded-lg bg-amber px-4 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-40">
                    Import & Populate Scorecard
                  </button>
                </div>
              )}
            </div>

            {/* Manual Fields */}
            <FormField label="Your Company Name" value={formData.your_company || ""} onChange={(v) => setField("your_company", v)} placeholder="My Startup" />
            <ScoreFields prefix="your" label="Your Scores (1-10)" formData={formData} setField={setField} />

          <div className="border-t border-white/[0.06] pt-4">
            <FormField label="Competitor 1" value={formData.comp1_name || ""} onChange={(v) => setField("comp1_name", v)} placeholder="Competitor name" />
            {formData.comp1_name && <div className="mt-3"><ScoreFields prefix="comp1" label="Comp 1 Scores" formData={formData} setField={setField} /></div>}
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <FormField label="Competitor 2" value={formData.comp2_name || ""} onChange={(v) => setField("comp2_name", v)} placeholder="Competitor name (optional)" />
            {formData.comp2_name && <div className="mt-3"><ScoreFields prefix="comp2" label="Comp 2 Scores" formData={formData} setField={setField} /></div>}
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <FormField label="Competitor 3" value={formData.comp3_name || ""} onChange={(v) => setField("comp3_name", v)} placeholder="Competitor name (optional)" />
            {formData.comp3_name && <div className="mt-3"><ScoreFields prefix="comp3" label="Comp 3 Scores" formData={formData} setField={setField} /></div>}
          </div>
        </div>
        );
      }}
    </ToolLayout>
  );
}
