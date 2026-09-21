import { PaymentCapability } from '@common/shared-libs';

import { SupportsCharge } from './supports-charge.interface';
import { SupportsPayout } from './supports-payout.interface';
import { SupportsMethodVault } from './supports-method-vault.interface';
import { SupportsHostedSetup } from './supports-hosted-setup.interface';
import { SupportsWebhooks } from './supports-webhooks.interface';

export interface PaymentCapabilityContract {
  [PaymentCapability.CHARGE]: SupportsCharge;
  [PaymentCapability.HOSTED_SETUP]: SupportsHostedSetup;
  [PaymentCapability.METHOD_VAULT]: SupportsMethodVault;
  [PaymentCapability.PAYOUT]: SupportsPayout;
  [PaymentCapability.WEBHOOKS]: SupportsWebhooks;
}
