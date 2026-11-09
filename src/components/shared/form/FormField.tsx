import { InfoTip } from "@/components/ui/InfoTip";
import { cn } from "@/lib/utils/cn";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  tip?: string;
  children: React.ReactNode;
  className?: string;
};

/** Label + control + error message, with optional plain-language tip. Reused by every form. */
export function FormField({ id, label, error, tip, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {tip && <InfoTip text={tip} label={`About ${label}`} />}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded-brand border border-border bg-surface px-4 py-3 text-base md:text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none aria-[invalid=true]:border-danger";
