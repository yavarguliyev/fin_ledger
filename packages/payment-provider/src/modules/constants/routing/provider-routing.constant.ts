import { ProviderErrorCategory } from '@common/shared-libs';

export const PROVIDER_ROUTING = {
  ALL_CURRENCIES: [] as readonly string[],
  ALL_COUNTRIES: [] as readonly string[],
  DEFAULT_PRIORITY: 100,
  NO_CANDIDATE_MESSAGE: 'No payment provider can handle this request',
  FAILOVER_CATEGORIES: [ProviderErrorCategory.CIRCUIT_OPEN] as readonly ProviderErrorCategory[]
} as const;
