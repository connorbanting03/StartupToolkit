"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";
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

const CHART_STYLES = {
  backgroundColor: "#1e1e1e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f5f0e8",
};
const COLORS = ["#d47c2f", "#60a5fa", "#34d399", "#a78bfa"];

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
  const yourScore = companyScores.find((c) => c.prefix === "your");

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
        {companyScores.map((c, i) => (
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
  return (
    <ToolLayout
      toolName="Competitor Scorecard"
      toolSlug="competitor_scorecard"
      description="Rate yourself and competitors across key dimensions to identify your competitive advantages."
      outputSection={CompetitorOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-5">
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
      )}
    </ToolLayout>
  );
}
