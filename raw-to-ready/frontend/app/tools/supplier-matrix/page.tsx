"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { FormField, TextAreaField } from "@/components/tools/form-fields";
import { Star } from "lucide-react";

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
  return (
    <ToolLayout
      toolName="Supplier Comparison Matrix"
      toolSlug="supplier_matrix"
      description="Compare up to 4 suppliers side-by-side on cost, MOQ, lead time, and more."
      outputSection={SupplierOutput}
    >
      {({ formData, setField }) => {
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
