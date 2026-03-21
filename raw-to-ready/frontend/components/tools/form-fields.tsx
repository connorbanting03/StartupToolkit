import { cn } from "@/lib/utils";

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
}: FormFieldProps) {
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
          className={cn(
            "w-full rounded-lg border border-white/[0.08] bg-charcoal-lighter px-3 py-2 text-sm text-cream placeholder-muted/40 outline-none transition-colors focus:border-amber/40",
            prefix && "pl-7",
            suffix && "pr-8"
          )}
        />
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
