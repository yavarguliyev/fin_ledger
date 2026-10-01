import { PaymentCapability } from '@common/shared-libs';

import { PaymentCapabilityContract } from '../interfaces/payment-capability-contract.interface';
import { PaymentProviderCore } from '../interfaces/payment-provider-core.interface';

export type CapableProvider<C extends PaymentCapability> = PaymentProviderCore & PaymentCapabilityContract[C];
