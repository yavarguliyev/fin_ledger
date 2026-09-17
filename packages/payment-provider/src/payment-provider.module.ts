import { DynamicModule, Module } from '@nestjs/common';
import { PAYMENT_PROVIDER_REGISTRY } from '@common/shared-libs';

import { PaymentProviderRegistry } from './registry/payment-provider.registry';
import { StripeAdapter } from './adapters/stripe/stripe.adapter';

@Module({})
export class PaymentProviderModule {
  static forRoot (): DynamicModule {
    const registryProvider = {
      provide: PaymentProviderRegistry,
      useFactory: (stripe: StripeAdapter): PaymentProviderRegistry => {
        const registry = new PaymentProviderRegistry();
        registry.register(stripe);
        return registry;
      },
      inject: [StripeAdapter]
    };

    return {
      module: PaymentProviderModule,
      providers: [
        StripeAdapter,
        registryProvider,
        { provide: PAYMENT_PROVIDER_REGISTRY, useExisting: PaymentProviderRegistry }
      ],
      exports: [PaymentProviderRegistry, PAYMENT_PROVIDER_REGISTRY, StripeAdapter]
    };
  }
}
