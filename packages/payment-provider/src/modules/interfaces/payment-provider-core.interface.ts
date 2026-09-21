import { PaymentCapability, PaymentProvider } from '@common/shared-libs';

import type { CapabilityDto } from '../dtos/contract/capability.dto';

export interface PaymentProviderCore {
  readonly providerName: PaymentProvider;
  readonly capabilities: readonly PaymentCapability[];
  supports(dto: CapabilityDto): boolean;
}
