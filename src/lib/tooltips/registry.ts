import { marketingTips } from "./marketing";

/**
 * Every tooltip in the app lives in a per-domain dictionary and is merged here.
 * Copy rule: plain everyday language, no jargon, one or two short sentences.
 */
const registry = {
  ...marketingTips,
} as const;

export type TooltipKey = keyof typeof registry;

export function hasTooltip(key: string): key is TooltipKey {
  return key in registry;
}

export function getTooltip(key: TooltipKey | string): string {
  return hasTooltip(key) ? registry[key] : "";
}
