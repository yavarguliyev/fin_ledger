import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@common/shared-libs';

import { CapableProvider } from '../types/capable-provider.type';
import { IPaymentProvider } from '../types/payment-provider.type';
import { ProviderNameDto } from '../dtos/contract/provider-name.dto';
import { RequireProviderDto } from '../dtos/contract/require-provider.dto';
import { RegisterProviderDto } from '../dtos/contract/register-provider.dto';
import { RouteProvidersDto } from '../dtos/contract/route-providers.dto';
import { ProviderSupport } from '../interfaces/provider-support.interface';
import { PROVIDER_ROUTING } from '../constants/routing/provider-routing.constant';

@Injectable()
export class PaymentProviderRegistry {
  private readonly logger = new Logger(PaymentProviderRegistry.name);
  private readonly providers = new Map<PaymentProvider, IPaymentProvider>();

  has = ({ providerName }: ProviderNameDto): boolean => this.providers.has(providerName);
  available = (): PaymentProvider[] => Array.from(this.providers.keys());
  getAll = (): IPaymentProvider[] => Array.from(this.providers.values());

  register ({ provider }: RegisterProviderDto): void {
    this.providers.set(provider.providerName, provider);
    this.logger.log(`Registered payment provider ${provider.providerName} [${provider.capabilities.join(', ')}]`);
  }

  get ({ providerName }: ProviderNameDto): IPaymentProvider {
    const provider = this.providers.get(providerName);
    if (!provider) throw new NotFoundException(`Payment provider not found: ${providerName ?? ''}`);
    return provider;
  }

  routeOrThrow (dto: RouteProvidersDto): IPaymentProvider[] {
    const candidates = this.route(dto);
    if (candidates.length === 0) throw new BadRequestException(PROVIDER_ROUTING.NO_CANDIDATE_MESSAGE);
    return candidates;
  }

  require<D extends RequireProviderDto> ({ providerName, capability }: D): CapableProvider<D['capability']> {
    const provider = this.get({ providerName });
    if (!provider.supports({ capability })) throw new BadRequestException(`Payment provider ${providerName} does not support ${capability}`);
    return provider as CapableProvider<D['capability']>;
  }

  route ({ capability, currency, country, exclude = [] }: RouteProvidersDto): IPaymentProvider[] {
    return this.getAll()
      .filter(provider => provider.supports({ capability }))
      .filter(provider => !exclude.includes(provider.providerName))
      .filter(provider => PaymentProviderRegistry.handles({ supported: provider.supportedCurrencies, value: currency }))
      .filter(provider => PaymentProviderRegistry.handles({ supported: provider.supportedCountries, value: country }))
      .sort((first, second) => first.priority - second.priority);
  }

  private static handles ({ supported, value }: ProviderSupport): boolean {
    if (supported.length === 0 || !value) return true;
    return supported.some(entry => entry.toUpperCase() === value.toUpperCase());
  }
}
