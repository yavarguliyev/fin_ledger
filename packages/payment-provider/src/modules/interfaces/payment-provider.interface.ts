import { SupportsCharge } from './supports-charge.interface';
import { SupportsPayout } from './supports-payout.interface';
import { SupportsMethodVault } from './supports-method-vault.interface';
import { SupportsHostedSetup } from './supports-hosted-setup.interface';
import { SupportsWebhooks } from './supports-webhooks.interface';
import { PaymentProviderCore } from './payment-provider-core.interface';

export type IPaymentProvider = PaymentProviderCore &
  Partial<SupportsCharge & SupportsPayout & SupportsMethodVault & SupportsHostedSetup & SupportsWebhooks>;
