/** No adapters are enabled until source access and display rights are established. */
export type VerifiedOffer = { variantId: string; providerId: string; manufacturerPartNumber: string; retailer: string; amount: number; currency: string; sourceUrl: string; retrievedAt: string; verifiedAt: string; expiresAt: string; match: 'exact' };
export interface PricingProvider {
  readonly id: string;
  readonly approvedDomains: readonly string[];
  readonly requestsPerMinute: number;
  readonly minimumRefreshMs: number;
  findExactVariant(identity: { manufacturer: string; model: string; manufacturerPartNumber: string; gtin?: string; revision?: string; size?: string; finish?: string }): Promise<string | null>;
  fetchOffer(providerVariantId: string, signal: AbortSignal): Promise<VerifiedOffer | null>;
}
export function visibleOffer(offer: VerifiedOffer | null, variantId: string, enabled = false, approvedProviders: readonly string[] = []) {
  if (!enabled || !offer || !approvedProviders.includes(offer.providerId) || offer.variantId !== variantId || offer.match !== 'exact' || !Number.isFinite(offer.amount) || offer.amount <= 0 || !/^[A-Z]{3}$/.test(offer.currency) || !Number.isFinite(Date.parse(offer.expiresAt)) || Date.parse(offer.expiresAt) <= Date.now()) return null;
  return offer;
}
