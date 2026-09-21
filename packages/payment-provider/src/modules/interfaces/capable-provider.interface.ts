import { PaymentCapability } from '@common/shared-libs';

import { PaymentCapabilityContract } from './payment-capability-contract.interface';
import { PaymentProviderCore } from './payment-provider-core.interface';

export type CapableProvider<C extends PaymentCapability> = PaymentProviderCore & PaymentCapabilityContract[C];
