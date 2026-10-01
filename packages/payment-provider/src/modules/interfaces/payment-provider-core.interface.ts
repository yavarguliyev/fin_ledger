import { PaymentCapability, PaymentProvider } from '@common/shared-libs';

import type { CapabilityDto } from '../dtos/contract/capability.dto';

export interface PaymentProviderCore {
  readonly providerName: PaymentProvider;
  readonly capabilities: readonly PaymentCapability[];
  readonly supportedCurrencies: readonly string[];
  readonly supportedCountries: readonly string[];
  readonly priority: number;

  supports(dto: CapabilityDto): boolean;
  isAvailable(): boolean;
}
