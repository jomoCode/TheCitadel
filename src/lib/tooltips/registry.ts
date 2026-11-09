import { adminTips } from "./admin";
import { billingTips } from "./billing";
import { contentTips } from "./content";
import { marketingTips } from "./marketing";
import { supportTips } from "./support";
import { visitorTips } from "./visitors";
import { websiteTips } from "./website";

/**
 * Every tooltip in the app lives in a per-domain dictionary and is merged here.
 * Copy rule: plain everyday language, no jargon, one or two short sentences.
 */
const registry = {
  ...marketingTips,
  ...adminTips,
  ...billingTips,
  ...supportTips,
  ...visitorTips,
  ...websiteTips,
  ...contentTips,
} as const;

export type TooltipKey = keyof typeof registry;

export function hasTooltip(key: string): key is TooltipKey {
  return key in registry;
}

export function getTooltip(key: TooltipKey | string): string {
  return hasTooltip(key) ? registry[key] : "";
}
