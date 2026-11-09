import { InfoTip } from "@/components/ui/InfoTip";

type PageHeaderProps = { title: string; description?: string; tip?: string; actions?: React.ReactNode; eyebrow?: string };

/** Title row for app screens. On phones actions wrap under the title; on desktop they sit to the right. */
export function PageHeader({ title, description, tip, actions, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-eyebrow text-gold">{eyebrow}</p>}
        <h1 className="mt-1 flex items-center gap-1.5 font-display text-3xl leading-tight md:text-4xl">
          <span className="truncate">{title}</span>
          {tip && <InfoTip text={tip} label={`About ${title}`} />}
        </h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
