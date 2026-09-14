import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PAYMENT_PROVIDER, PAYMENT_PROVIDER_REGISTRY } from '@common/shared-libs';

import { PaymentProviderRegistry } from './registry/payment-provider.registry';
import { LocalPaymentAdapter } from './adapters/local/local-payment.adapter';
import { StripeAdapter } from './adapters/stripe/stripe.adapter';
import { IPaymentProvider } from './interfaces/payment-provider.interface';

@Module({})
export class PaymentProviderModule {
  static forRoot (): DynamicModule {
    const registryProvider = {
      provide: PaymentProviderRegistry,
      useFactory: (local: LocalPaymentAdapter, stripe: StripeAdapter): PaymentProviderRegistry => {
        const registry = new PaymentProviderRegistry();
        registry.register(local);
        registry.register(stripe);
        return registry;
      },
      inject: [LocalPaymentAdapter, StripeAdapter]
    };

    const activeProvider = {
      provide: PAYMENT_PROVIDER,
      useFactory: (registry: PaymentProviderRegistry, configService: ConfigService): IPaymentProvider => {
        const raw = configService.get<string>('PAYMENT_PROVIDER');
        const configuredName = raw && raw.trim().length > 0 ? raw.trim() : PaymentProvider.LOCAL;
        return registry.get(configuredName);
      },
      inject: [PaymentProviderRegistry, ConfigService]
    };

    return {
      module: PaymentProviderModule,
      providers: [
        LocalPaymentAdapter,
        StripeAdapter,
        registryProvider,
        activeProvider,
        { provide: PAYMENT_PROVIDER_REGISTRY, useExisting: PaymentProviderRegistry }
      ],
      exports: [PaymentProviderRegistry, PAYMENT_PROVIDER_REGISTRY, PAYMENT_PROVIDER, LocalPaymentAdapter, StripeAdapter]
    };
  }
}
