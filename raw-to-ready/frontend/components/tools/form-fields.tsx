import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
  step?: number;
  min?: number;
  max?: number;
}

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  prefix,
  suffix,
  hint,
  step,
  min,
  max,
}: FormFieldProps) {
  const isNumber = type === "number";

  const nudge = (direction: 1 | -1) => {
    const current = parseFloat(String(value)) || 0;
    const s = step ?? 1;
    let next = current + direction * s;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    // Preserve decimal precision from step
    const decimals = s.toString().includes(".") ? s.toString().split(".")[1].length : 0;
    onChange(decimals > 0 ? next.toFixed(decimals) : String(next));
  };

  return (
    <div className={cn("", className)}>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted/60">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          className={cn(
            "w-full rounded-lg border border-white/[0.08] bg-charcoal-lighter px-3 py-2 text-sm text-cream placeholder-muted/40 outline-none transition-colors focus:border-amber/40",
            prefix && "pl-7",
            isNumber && suffix ? "pr-16" : isNumber ? "pr-8" : "",
            !isNumber && suffix && "pr-8"
          )}
        />
        {isNumber && (
          <div className="absolute right-0 top-0 flex h-full flex-col border-l border-white/[0.08]" style={suffix ? { right: "2rem" } : undefined}>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => nudge(1)}
              className="flex flex-1 items-center px-1.5 text-muted/50 transition-colors hover:text-amber"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <div className="border-t border-white/[0.06]" />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => nudge(-1)}
              className="flex flex-1 items-center px-1.5 text-muted/50 transition-colors hover:text-amber"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted/60">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted/50">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("", className)}>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/[0.08] bg-charcoal-lighter px-3 py-2 text-sm text-cream outline-none transition-colors focus:border-amber/40"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div className={cn("", className)}>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-white/[0.08] bg-charcoal-lighter px-3 py-2 text-sm text-cream placeholder-muted/40 outline-none transition-colors focus:border-amber/40"
      />
    </div>
  );
}
