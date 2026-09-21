import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@common/shared-libs';

import { CapableProvider } from '../interfaces/capable-provider.interface';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { ProviderNameDto } from '../dtos/contract/provider-name.dto';
import { RequireProviderDto } from '../dtos/contract/require-provider.dto';
import { RegisterProviderDto } from '../dtos/contract/register-provider.dto';

@Injectable()
export class PaymentProviderRegistry {
  private readonly logger = new Logger(PaymentProviderRegistry.name);
  private readonly providers = new Map<PaymentProvider, IPaymentProvider>();

  has ({ providerName }: ProviderNameDto): boolean {
    return this.providers.has(providerName);
  }

  available (): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }

  getAll (): IPaymentProvider[] {
    return Array.from(this.providers.values());
  }

  register ({ provider }: RegisterProviderDto): void {
    this.providers.set(provider.providerName, provider);
    this.logger.log(`Registered payment provider ${provider.providerName} [${provider.capabilities.join(', ')}]`);
  }

  get ({ providerName }: ProviderNameDto): IPaymentProvider {
    const provider = this.providers.get(providerName);
    if (!provider) throw new NotFoundException(`Payment provider not found: ${providerName ?? ''}`);
    return provider;
  }

  require<D extends RequireProviderDto> ({ providerName, capability }: D): CapableProvider<D['capability']> {
    const provider = this.get({ providerName });

    if (!provider.supports({ capability })) {
      throw new BadRequestException(`Payment provider ${providerName} does not support ${capability}`);
    }

    return provider as CapableProvider<D['capability']>;
  }
}
