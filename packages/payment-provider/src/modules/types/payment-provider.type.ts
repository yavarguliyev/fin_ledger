import { SupportsCharge } from '../interfaces/supports-charge.interface';
import { SupportsPayout } from '../interfaces/supports-payout.interface';
import { SupportsMethodVault } from '../interfaces/supports-method-vault.interface';
import { SupportsHostedSetup } from '../interfaces/supports-hosted-setup.interface';
import { SupportsWebhooks } from '../interfaces/supports-webhooks.interface';
import { PaymentProviderCore } from '../interfaces/payment-provider-core.interface';

export type IPaymentProvider = PaymentProviderCore &
  Partial<SupportsCharge & SupportsPayout & SupportsMethodVault & SupportsHostedSetup & SupportsWebhooks>;
