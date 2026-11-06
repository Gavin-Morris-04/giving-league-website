import "server-only";
import type { FundraisingCampaignRecord } from "@/lib/types";

/**
 * Method B — approved integrations.
 *
 * A provider turns a charity's AUTHORIZED reporting channel (an API key the charity issued us, an approved data
 * feed, a signed export) into a verified cumulative total for one campaign. Nothing here scrapes donor portals or
 * works around access controls, and no provider is enabled until the charity grants access in writing.
 *
 * To add one: implement FundraisingProvider, register it below, and store the credentials as server-only
 * environment variables. `syncIntegrationTotals` (see sync.ts) records each result as a new append-only report.
 */
export type ProviderTotal = {
  /** Cumulative verified total in cents for the campaign. */
  amountCents: number;
  /** The date the charity's system says the total is current as of (ISO). */
  asOf: string;
  /** Where the number came from, e.g. "Provider API: campaign 1234, fetched 2027-04-02T10:00Z". */
  sourceReference: string;
};

export interface FundraisingProvider {
  id: string;
  label: string;
  /** True only when the charity has issued credentials and they're present in the environment. */
  isConfigured(): boolean;
  fetchCumulativeTotal(campaign: FundraisingCampaignRecord): Promise<ProviderTotal>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`Fundraising provider "${providerId}" is not configured. A charity must approve access first.`);
    this.name = "ProviderNotConfiguredError";
  }
}

/**
 * Placeholder slots for charities named in the plan. They deliberately do nothing: we do NOT assume St. Jude or
 * Make-A-Wish offer a public API. If a charity grants an integration, replace the body with their documented call.
 */
function placeholderProvider(id: string, label: string): FundraisingProvider {
  return {
    id,
    label,
    isConfigured: () => false,
    async fetchCumulativeTotal() {
      throw new ProviderNotConfiguredError(id);
    },
  };
}

export const providers: Record<string, FundraisingProvider> = {
  "st-jude": placeholderProvider("st-jude", "St. Jude fundraising page (requires St. Jude approval)"),
  "make-a-wish": placeholderProvider("make-a-wish", "Make-A-Wish fundraising page (requires Make-A-Wish approval)"),
};

export function providerFor(campaign: FundraisingCampaignRecord): FundraisingProvider | undefined {
  return providers[campaign.charityId];
}
