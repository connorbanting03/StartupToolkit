"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/tool-layout";
import { TextAreaField } from "@/components/tools/form-fields";
import { ExternalLink, Copy, Check, Sparkles, Upload } from "lucide-react";

const CLAUDE_URL = "https://claude.ai/new";

const SECTIONS = [
  {
    key: "key_partners",
    label: "Key Partners",
    hint: "Who are your key partners & suppliers? What resources do they provide?",
    color: "#a78bfa",
    gridArea: "kp",
  },
  {
    key: "key_activities",
    label: "Key Activities",
    hint: "What key activities does your value proposition require?",
    color: "#60a5fa",
    gridArea: "ka",
  },
  {
    key: "key_resources",
    label: "Key Resources",
    hint: "What key resources does your value proposition require?",
    color: "#34d399",
    gridArea: "kr",
  },
  {
    key: "value_propositions",
    label: "Value Propositions",
    hint: "What value do you deliver to the customer? Which problems are you solving?",
    color: "#d47c2f",
    gridArea: "vp",
  },
  {
    key: "customer_relationships",
    label: "Customer Relationships",
    hint: "What type of relationship does each segment expect?",
    color: "#f472b6",
    gridArea: "cr",
  },
  {
    key: "channels",
    label: "Channels",
    hint: "Through which channels do your segments want to be reached?",
    color: "#22d3ee",
    gridArea: "ch",
  },
  {
    key: "customer_segments",
    label: "Customer Segments",
    hint: "For whom are you creating value? Who are your most important customers?",
    color: "#fb923c",
    gridArea: "cs",
  },
  {
    key: "cost_structure",
    label: "Cost Structure",
    hint: "What are the most important costs inherent to your business model?",
    color: "#ef4444",
    gridArea: "cost",
  },
  {
    key: "revenue_streams",
    label: "Revenue Streams",
    hint: "For what value are your customers willing to pay? How do they pay?",
    color: "#22c55e",
    gridArea: "rev",
  },
];

function generatePrompt(businessName: string, businessDescription: string): string {
  return `I'm building a Business Model Canvas for my startup${businessName ? ` called "${businessName}"` : ""}.${businessDescription ? ` Here's what we do: ${businessDescription}` : ""}

Please fill out all 9 sections of a Business Model Canvas for this business. Return your answer in EXACTLY this format — each section starts with the section name in square brackets, followed by bullet points. Use this exact structure with no extra text before or after:

[Key Partners]
- Partner/supplier 1
- Partner/supplier 2

[Key Activities]
- Activity 1
- Activity 2

[Key Resources]
- Resource 1
- Resource 2

[Value Propositions]
- Value prop 1
- Value prop 2

[Customer Relationships]
- Relationship type 1
- Relationship type 2

[Channels]
- Channel 1
- Channel 2

[Customer Segments]
- Segment 1
- Segment 2

[Cost Structure]
- Cost 1
- Cost 2

[Revenue Streams]
- Revenue source 1
- Revenue source 2

Give 3-5 bullet points per section. Be specific to my business, not generic. Only return the formatted canvas — no intro, no summary, no extra commentary.`;
}

function parseClaudeOutput(text: string): Record<string, string> {
  const sectionMap: Record<string, string> = {
    "Key Partners": "key_partners",
    "Key Activities": "key_activities",
    "Key Resources": "key_resources",
    "Value Propositions": "value_propositions",
    "Customer Relationships": "customer_relationships",
    "Channels": "channels",
    "Customer Segments": "customer_segments",
    "Cost Structure": "cost_structure",
    "Revenue Streams": "revenue_streams",
  };

  const result: Record<string, string> = {};
  const regex = /\[([^\]]+)\]\s*\n([\s\S]*?)(?=\n\[|$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const sectionTitle = match[1].trim();
    const content = match[2].trim();
    const fieldKey = sectionMap[sectionTitle];
    if (fieldKey) {
      result[fieldKey] = content;
    }
  }

  return result;
}

// ─── Canvas Visual Output ───────────────────────────────────
function CanvasOutput({ formData }: { formData: Record<string, any> }) {
  const hasSomeContent = SECTIONS.some((s) => formData[s.key]?.trim());

  if (!hasSomeContent) {
    return (
      <p className="text-sm text-muted">
        Fill in the canvas sections above — or use the Claude prompt to auto-populate everything.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Canvas Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(10, 1fr)",
          gridTemplateRows: "auto auto auto",
          gridTemplateAreas: `
            "kp kp ka ka vp vp cr cr cs cs"
            "kp kp kr kr vp vp ch ch cs cs"
            "cost cost cost cost cost rev rev rev rev rev"
          `,
        }}
      >
        {SECTIONS.map((section) => {
          const content = formData[section.key] || "";
          const lines = content
            .split("\n")
            .map((l: string) => l.trim())
            .filter((l: string) => l);

          return (
            <div
              key={section.key}
              className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-3"
              style={{ gridArea: section.gridArea }}
            >
              <p
                className="mb-2 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: section.color }}
              >
                {section.label}
              </p>
              {lines.length > 0 ? (
                <ul className="space-y-1">
                  {lines.map((line: string, i: number) => (
                    <li key={i} className="text-xs leading-relaxed text-cream/80">
                      {line.replace(/^[-•]\s*/, "• ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] italic text-muted/50">Empty</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-3 text-center">
          <p className="text-xs text-muted">Sections Filled</p>
          <p className="mt-1 font-display text-lg font-bold text-cream">
            {SECTIONS.filter((s) => formData[s.key]?.trim()).length}/9
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-3 text-center">
          <p className="text-xs text-muted">Total Items</p>
          <p className="mt-1 font-display text-lg font-bold text-amber">
            {SECTIONS.reduce((sum, s) => {
              const lines = (formData[s.key] || "")
                .split("\n")
                .filter((l: string) => l.trim());
              return sum + lines.length;
            }, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-3 text-center">
          <p className="text-xs text-muted">Completeness</p>
          <p className="mt-1 font-display text-lg font-bold text-green-400">
            {Math.round(
              (SECTIONS.filter((s) => formData[s.key]?.trim()).length / 9) * 100
            )}
            %
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function BusinessModelCanvasPage() {
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  return (
    <ToolLayout
      toolName="Business Model Canvas"
      toolSlug="business_model_canvas"
      description="Map out all 9 building blocks of your business model. Use the Claude prompt to auto-generate a canvas, then refine it."
      outputSection={CanvasOutput}
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

        const handleImport = () => {
          const parsed = parseClaudeOutput(importText);
          const keys = Object.keys(parsed);
          if (keys.length === 0) {
            setImportError(
              "Couldn't parse any sections. Make sure the output uses [Section Name] format."
            );
            return;
          }
          setImportError("");
          keys.forEach((key) => setField(key, parsed[key]));
          setShowImport(false);
          setImportText("");
        };

        return (
          <div className="space-y-6">
            {/* Claude Integration Banner */}
            <div className="rounded-xl border border-amber/20 bg-amber/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber" />
                <p className="text-sm font-medium text-cream">
                  Auto-fill with Claude
                </p>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-muted">
                Use Claude to generate a complete Business Model Canvas for your
                business. Add your business details below, copy the prompt, paste
                it in Claude, then import the response back here.
              </p>

              <div className="mb-3 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    Business Name (for prompt)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setField("business_name", e.target.value)}
                    placeholder="e.g. My Startup"
                    className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    Brief Description (for prompt)
                  </label>
                  <textarea
                    value={businessDesc}
                    onChange={(e) =>
                      setField("business_description", e.target.value)
                    }
                    placeholder="e.g. We sell handmade candles directly to consumers through our website and local markets..."
                    rows={2}
                    className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="mb-3 max-h-32 overflow-y-auto rounded-lg border border-white/[0.06] bg-charcoal p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted/70">
                  {prompt}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-charcoal px-3 py-1.5 text-xs font-medium text-cream transition hover:border-amber/30"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied!" : "Copy Prompt"}
                </button>
                <a
                  href={CLAUDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-amber px-3 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90"
                >
                  Open Claude
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={() => setShowImport(!showImport)}
                  className="flex items-center gap-1.5 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-medium text-amber transition hover:bg-amber/10"
                >
                  <Upload className="h-3 w-3" />
                  Import Response
                </button>
              </div>

              {/* Import Panel */}
              {showImport && (
                <div className="mt-3 space-y-2 rounded-lg border border-white/[0.06] bg-charcoal p-3">
                  <p className="text-xs text-muted">
                    Paste Claude&apos;s response below and click Import:
                  </p>
                  <textarea
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportError("");
                    }}
                    rows={8}
                    placeholder="Paste the full Claude response here..."
                    className="w-full rounded-lg border border-white/[0.06] bg-charcoal-lighter px-3 py-2 text-xs text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none"
                  />
                  {importError && (
                    <p className="text-xs text-red-400">{importError}</p>
                  )}
                  <button
                    onClick={handleImport}
                    disabled={!importText.trim()}
                    className="rounded-lg bg-amber px-4 py-1.5 text-xs font-medium text-charcoal transition hover:bg-amber/90 disabled:opacity-40"
                  >
                    Import & Populate Canvas
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Sections */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Canvas Sections
              </p>
              {SECTIONS.map((section) => (
                <div key={section.key}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: section.color }}
                    />
                    <label className="text-xs font-medium text-cream">
                      {section.label}
                    </label>
                  </div>
                  <p className="mb-1.5 text-[11px] text-muted/60">
                    {section.hint}
                  </p>
                  <textarea
                    value={formData[section.key] || ""}
                    onChange={(e) => setField(section.key, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${section.label.toLowerCase()}...`}
                    className="w-full rounded-lg border border-white/[0.06] bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-muted/40 focus:border-amber/40 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </ToolLayout>
  );
}
