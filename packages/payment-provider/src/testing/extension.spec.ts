import { PaymentCapability, PaymentProvider, ProviderChargeStatus } from '@common/shared-libs';

import { BasePaymentAdapter } from '../modules/adapters/base/base-payment.adapter';
import { PaymentProviderRegistry } from '../modules/registry/payment-provider.registry';
import { SupportsPayout } from '../modules/interfaces/supports-payout.interface';
import { SupportsWebhooks } from '../modules/interfaces/supports-webhooks.interface';
import { PayoutFundsDto } from '../modules/dtos/operation/payout-funds.dto';
import { ProviderChargeResultDto } from '../modules/dtos/operation/provider-charge-result.dto';
import { WebhookEventDto } from '../modules/dtos/operation/webhook-event.dto';
import { ExtractSignatureDto } from '../modules/dtos/contract/extract-signature.dto';
import { ConstructWebhookEventDto } from '../modules/dtos/contract/construct-webhook-event.dto';
import { runProviderContractTests } from './provider-contract';

class PayoutOnlyAdapter extends BasePaymentAdapter implements SupportsPayout, SupportsWebhooks {
  readonly providerName = PaymentProvider.ADYEN;
  readonly capabilities = [PaymentCapability.PAYOUT, PaymentCapability.WEBHOOKS];

  constructor () {
    super({ name: PayoutOnlyAdapter.name });
  }

  extractSignature ({ headers }: ExtractSignatureDto): string {
    return this.headerValue({ headers, name: 'x-provider-hmac' });
  }

  constructWebhookEvent (dto: ConstructWebhookEventDto): Promise<WebhookEventDto> {
    return Promise.resolve().then(() => this.simulateWebhook(dto));
  }

  async payout (dto: PayoutFundsDto): Promise<ProviderChargeResultDto> {
    return this.executeOperation({
      prefix: 'po',
      amount: dto.amount,
      currency: dto.currency,
      operation: () => Promise.resolve('po_external_1')
    });
  }
}

runProviderContractTests({
  name: 'PayoutOnly',
  create: () => new PayoutOnlyAdapter(),
  expectedCapabilities: [PaymentCapability.PAYOUT, PaymentCapability.WEBHOOKS]
});

describe('extending the registry with a new provider', () => {
  const registry = (): PaymentProviderRegistry => {
    const instance = new PaymentProviderRegistry();
    instance.register({ provider: new PayoutOnlyAdapter() });

    return instance;
  };

  it('registers without any change to the registry', () => {
    expect(registry().available()).toContain(PaymentProvider.ADYEN);
  });

  it('narrows to the capability that was asked for', async () => {
    const provider = registry().require({ providerName: PaymentProvider.ADYEN, capability: PaymentCapability.PAYOUT });
    const result = await provider.payout({ amount: 500, currency: 'USD', recipientToken: 'acct_1', idempotencyKey: 'k' });

    expect(result.status).toBe(ProviderChargeStatus.SUCCEEDED);
  });

  it('refuses a capability the provider does not declare, instead of crashing later', () => {
    expect(() => registry().require({ providerName: PaymentProvider.ADYEN, capability: PaymentCapability.HOSTED_SETUP })).toThrow(/does not support HOSTED_SETUP/);
    expect(() => registry().require({ providerName: PaymentProvider.ADYEN, capability: PaymentCapability.CHARGE })).toThrow(/does not support CHARGE/);
  });

  it('reports an unregistered provider as not found', () => {
    expect(() => registry().require({ providerName: PaymentProvider.PAYPAL, capability: PaymentCapability.CHARGE })).toThrow(/not found/i);
  });
});
