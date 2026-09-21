import { DynamicModule, Module, Type } from '@nestjs/common';
import { PAYMENT_PROVIDER_REGISTRY } from '@common/shared-libs';

import { PaymentProviderRegistry } from './registry/payment-provider.registry';
import { StripeAdapter } from './adapters/stripe/stripe.adapter';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { PaymentProviderModuleOptionsDto } from './dtos/module/payment-provider-module-options.dto';

const DEFAULT_ADAPTERS: Type<IPaymentProvider>[] = [StripeAdapter];

@Module({})
export class PaymentProviderModule {
  static forRoot (options: PaymentProviderModuleOptionsDto = {}): DynamicModule {
    const adapters = options.adapters ?? DEFAULT_ADAPTERS;

    const registryProvider = {
      provide: PaymentProviderRegistry,
      useFactory: (...instances: IPaymentProvider[]): PaymentProviderRegistry => {
        const registry = new PaymentProviderRegistry();
        instances.forEach(provider => registry.register({ provider }));

        return registry;
      },
      inject: adapters
    };

    return {
      module: PaymentProviderModule,
      providers: [...adapters, registryProvider, { provide: PAYMENT_PROVIDER_REGISTRY, useExisting: PaymentProviderRegistry }],
      exports: [PaymentProviderRegistry, PAYMENT_PROVIDER_REGISTRY, ...adapters]
    };
  }
}
