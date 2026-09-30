export const CREDIT_PACKS = [
  { id: "starter", label: "Starter", credits: 50, priceBdt: 150, priceUsd: 2 },
  { id: "standard", label: "Standard", credits: 200, priceBdt: 500, priceUsd: 5 },
  { id: "pro", label: "Pro", credits: 600, priceBdt: 1200, priceUsd: 12 },
] as const;

export type CreditPack = (typeof CREDIT_PACKS)[number];

export function getPack(id: unknown): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}