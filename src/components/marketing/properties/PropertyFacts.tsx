import { InfoTip } from "@/components/ui/InfoTip";
import type { Property } from "@/features/marketing/types";
import { formatBedrooms, priceLabel } from "@/lib/utils/format";

/** Key facts as a definition list: 2 columns on phones, a single row on desktop. */
export function PropertyFacts({ property }: { property: Property }) {
  const facts = [
    { label: property.priceFrom > 0 ? "Price from" : "Price", value: priceLabel(property.priceFrom), tip: property.priceFrom > 0 ? <InfoTip tip="marketing.priceFrom" /> : undefined },
    { label: "Homes", value: formatBedrooms(property.bedroomsMin, property.bedroomsMax) },
    { label: "Type", value: property.type },
    { label: "Completion", value: property.completion }, // hidden below when not given
    {
      label: "Payment plan",
      value: property.paymentPlan ? "Available" : "",
      tip: <InfoTip tip="marketing.paymentPlan" />,
    },
  ].filter((fact) => fact.value); // only show what we actually know

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-brand border border-border bg-border md:auto-cols-fr md:grid-flow-col">
      {facts.map((fact) => (
        <div key={fact.label} className="bg-background p-4 md:p-5">
          <dt className="text-eyebrow flex items-center gap-1 text-muted-foreground">{fact.label}{fact.tip}</dt>
          <dd className="mt-2 font-display text-lg">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
