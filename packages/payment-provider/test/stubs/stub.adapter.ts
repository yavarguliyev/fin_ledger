import { PaymentCapability, PaymentProvider } from '@common/shared-libs';

import { BasePaymentAdapter } from '../../src/modules/adapters/base/base-payment.adapter';

export class StubAdapter extends BasePaymentAdapter {
  readonly capabilities = [PaymentCapability.CHARGE];

  constructor (
    readonly providerName: PaymentProvider,
    override readonly priority: number,
    override readonly supportedCurrencies: readonly string[],
    private open = false
  ) {
    super({ name: providerName });
  }

  override isAvailable = (): boolean => !this.open;

  trip (): void {
    this.open = true;
  }
}
