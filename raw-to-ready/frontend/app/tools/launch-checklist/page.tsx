"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, SelectField, TextAreaField } from "@/components/tools/form-fields";

const CATEGORIES = [
  {
    name: "Legal & Admin",
    color: "#60a5fa",
    items: [
      { key: "register_business", label: "Register business entity (LLC, Corp, etc.)" },
      { key: "ein", label: "Get EIN / Tax ID" },
      { key: "business_license", label: "Apply for required licenses & permits" },
      { key: "trademark", label: "File trademark for brand name" },
      { key: "terms_privacy", label: "Draft Terms of Service & Privacy Policy" },
      { key: "contracts", label: "Prepare customer/vendor contract templates" },
    ],
  },
  {
    name: "Product",
    color: "#34d399",
    items: [
      { key: "mvp_defined", label: "Define MVP feature set" },
      { key: "mvp_built", label: "Build MVP / core product" },
      { key: "beta_testing", label: "Complete beta testing with real users" },
      { key: "feedback_loop", label: "Implement feedback collection system" },
      { key: "analytics", label: "Set up product analytics (Mixpanel, PostHog, etc.)" },
      { key: "error_monitoring", label: "Set up error monitoring (Sentry, etc.)" },
    ],
  },
  {
    name: "Finance",
    color: "#d47c2f",
    items: [
      { key: "business_bank", label: "Open business bank account" },
      { key: "accounting", label: "Set up accounting software" },
      { key: "payment_processor", label: "Set up payment processing (Stripe, etc.)" },
      { key: "pricing", label: "Finalize pricing strategy" },
      { key: "financial_model", label: "Create financial projections" },
      { key: "bookkeeper", label: "Hire bookkeeper / accountant" },
    ],
  },
  {
    name: "Marketing & Sales",
    color: "#a78bfa",
    items: [
      { key: "website_live", label: "Launch marketing website" },
      { key: "domain_email", label: "Set up custom domain & email" },
      { key: "social_profiles", label: "Create social media profiles" },
      { key: "content_plan", label: "Develop content marketing plan" },
      { key: "launch_campaign", label: "Plan launch campaign" },
      { key: "crm", label: "Set up CRM for lead tracking" },
    ],
  },
  {
    name: "Operations",
    color: "#f87171",
    items: [
      { key: "hosting", label: "Set up production hosting & CI/CD" },
      { key: "security", label: "Security audit & HTTPS setup" },
      { key: "backup", label: "Set up automated backups" },
      { key: "support_system", label: "Set up customer support system" },
      { key: "documentation", label: "Write user-facing documentation" },
      { key: "onboarding", label: "Create customer onboarding flow" },
    ],
  },
];

function LaunchOutput({ formData }: { formData: Record<string, any> }) {
  const allItems = CATEGORIES.flatMap((c) => c.items);
  const completed = allItems.filter((item) => formData[item.key] === "true" || formData[item.key] === true);
  const totalPercent = allItems.length > 0 ? Math.round((completed.length / allItems.length) * 100) : 0;

  const categoryProgress = CATEGORIES.map((cat) => {
    const done = cat.items.filter((item) => formData[item.key] === "true" || formData[item.key] === true);
    return { ...cat, done: done.length, total: cat.items.length, pct: Math.round((done.length / cat.items.length) * 100) };
  });

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter p-5 text-center">
        <p className="text-xs text-muted">Launch Readiness</p>
        <p className={`mt-1 font-display text-4xl font-bold ${totalPercent === 100 ? "text-green-400" : totalPercent > 60 ? "text-amber" : "text-cream"}`}>
          {totalPercent}%
        </p>
        <p className="mt-1 text-xs text-muted">{completed.length} of {allItems.length} items complete</p>
        <div className="mx-auto mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalPercent}%`, backgroundColor: totalPercent === 100 ? "#34d399" : "#d47c2f" }} />
        </div>
      </div>

      {/* Per-category progress bars */}
      <div className="space-y-3">
        {categoryProgress.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: cat.color }}>{cat.name}</span>
              <span className="text-xs text-muted">{cat.done}/{cat.total}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
            </div>
          </div>
        ))}
      </div>

      {totalPercent === 100 && (
        <div className="rounded-lg border border-green-400/20 bg-green-400/5 p-4 text-center">
          <p className="text-lg font-bold text-green-400">🚀 You&apos;re launch-ready!</p>
          <p className="mt-1 text-sm text-muted">All checklist items are complete. Time to ship.</p>
        </div>
      )}

      {totalPercent > 0 && totalPercent < 100 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Remaining Items</p>
          <div className="space-y-1">
            {CATEGORIES.flatMap((cat) =>
              cat.items.filter((item) => formData[item.key] !== "true" && formData[item.key] !== true).map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-sm text-cream/60">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {item.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <TextAreaField
        label="Launch Notes / Blockers"
        value={formData.launch_notes || ""}
        onChange={() => {}}
        placeholder="Add any notes about blockers or dependencies..."
      />
    </div>
  );
}

export default function LaunchChecklistPage() {
  return (
    <ToolLayout
      toolName="Launch Checklist"
      toolSlug="launch_checklist"
      description="Track everything you need to do before launching your startup."
      outputSection={LaunchOutput}
    >
      {({ formData, setField }) => (
        <div className="space-y-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <p className="mb-2 text-xs font-medium" style={{ color: cat.color }}>{cat.name}</p>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-charcoal-lighter px-4 py-3 transition-colors hover:border-white/[0.12]">
                    <input
                      type="checkbox"
                      checked={formData[item.key] === "true" || formData[item.key] === true}
                      onChange={(e) => setField(item.key, e.target.checked ? "true" : "false")}
                      className="h-4 w-4 rounded border-amber/40 bg-transparent text-amber accent-amber"
                    />
                    <span className={`text-sm ${formData[item.key] === "true" || formData[item.key] === true ? "text-muted line-through" : "text-cream"}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <TextAreaField
            label="Launch Notes"
            value={formData.launch_notes || ""}
            onChange={(v) => setField("launch_notes", v)}
            placeholder="Additional notes, blockers, dependencies..."
          />
        </div>
      )}
    </ToolLayout>
  );
}
