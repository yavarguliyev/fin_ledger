import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@common/shared-libs';

import { IPaymentProvider } from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentProviderRegistry {
  private readonly logger = new Logger(PaymentProviderRegistry.name);
  private readonly providers = new Map<PaymentProvider, IPaymentProvider>();

  has (providerName: PaymentProvider): boolean {
    return this.providers.has(providerName);
  }

  getAll (): IPaymentProvider[] {
    return Array.from(this.providers.values());
  }

  register (provider: IPaymentProvider): void {
    this.providers.set(provider.providerName, provider);
    this.logger.log(`Registered payment provider: ${provider.providerName}`);
  }

  get (providerName?: string): IPaymentProvider {
    const key = providerName && providerName.trim().length > 0 ? (providerName.trim() as PaymentProvider) : PaymentProvider.LOCAL;
    const provider = this.providers.get(key) ?? this.providers.get(PaymentProvider.LOCAL);
    if (!provider) throw new NotFoundException(`Payment provider not found: ${providerName ?? ''}`);
    return provider;
  }
}
