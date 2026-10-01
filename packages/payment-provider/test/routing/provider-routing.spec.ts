import { PaymentCapability, PaymentProvider, ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { BasePaymentAdapter } from '../../src/modules/adapters/base/base-payment.adapter';
import { PaymentProviderRegistry } from '../../src/modules/registry/payment-provider.registry';
import { ProviderFailoverHelper } from '../../src/modules/helpers/provider-failover.helper';
import { IPaymentProvider } from '../../src/modules/types/payment-provider.type';
import { ROUTING_TEST } from '../constants/routing.constant';

class StubAdapter extends BasePaymentAdapter {
  readonly capabilities = [PaymentCapability.CHARGE];

  constructor(
    readonly providerName: PaymentProvider,
    override readonly priority: number,
    override readonly supportedCurrencies: readonly string[],
    private open = false
  ) {
    super({ name: providerName });
  }

  override isAvailable = (): boolean => !this.open;

  trip(): void {
    this.open = true;
  }
}

const register = (providers: StubAdapter[]): PaymentProviderRegistry => {
  const registry = new PaymentProviderRegistry();
  providers.forEach(provider => registry.register({ provider: provider as unknown as IPaymentProvider }));

  return registry;
};

describe('PaymentProviderRegistry.route', () => {
  it('returns the candidates in priority order', () => {
    const backup = new StubAdapter(PaymentProvider.ADYEN, ROUTING_TEST.BACKUP_PRIORITY, [ROUTING_TEST.USD]);
    const primary = new StubAdapter(PaymentProvider.STRIPE, ROUTING_TEST.PRIMARY_PRIORITY, [ROUTING_TEST.USD]);

    const routed = register([backup, primary]).route({ capability: PaymentCapability.CHARGE, currency: ROUTING_TEST.USD });

    expect(routed.map(({ providerName }) => providerName)).toEqual([PaymentProvider.STRIPE, PaymentProvider.ADYEN]);
  });

  it('leaves out a provider that does not take the currency', () => {
    const primary = new StubAdapter(PaymentProvider.STRIPE, ROUTING_TEST.PRIMARY_PRIORITY, [ROUTING_TEST.USD]);
    const backup = new StubAdapter(PaymentProvider.ADYEN, ROUTING_TEST.BACKUP_PRIORITY, [ROUTING_TEST.JPY]);

    const routed = register([primary, backup]).route({ capability: PaymentCapability.CHARGE, currency: ROUTING_TEST.JPY });

    expect(routed.map(({ providerName }) => providerName)).toEqual([PaymentProvider.ADYEN]);
  });

  it('treats an empty currency list as taking everything', () => {
    const anyCurrency = new StubAdapter(PaymentProvider.PAYPAL, ROUTING_TEST.PRIMARY_PRIORITY, []);

    const routed = register([anyCurrency]).route({ capability: PaymentCapability.CHARGE, currency: ROUTING_TEST.JPY });

    expect(routed).toHaveLength(1);
  });

  it('honours an exclusion and refuses to invent a candidate', () => {
    const primary = new StubAdapter(PaymentProvider.STRIPE, ROUTING_TEST.PRIMARY_PRIORITY, [ROUTING_TEST.USD]);
    const registry = register([primary]);
    const request = { capability: PaymentCapability.CHARGE, currency: ROUTING_TEST.USD, exclude: [PaymentProvider.STRIPE] };

    expect(registry.route(request)).toHaveLength(0);
    expect(() => registry.routeOrThrow(request)).toThrow();
  });

  it('drops a provider that cannot do the capability', () => {
    const chargeOnly = new StubAdapter(PaymentProvider.STRIPE, ROUTING_TEST.PRIMARY_PRIORITY, []);

    expect(register([chargeOnly]).route({ capability: PaymentCapability.PAYOUT })).toHaveLength(0);
  });
});

describe('ProviderFailoverHelper.attempt', () => {
  const candidates = (): StubAdapter[] => [
    new StubAdapter(PaymentProvider.STRIPE, ROUTING_TEST.PRIMARY_PRIORITY, []),
    new StubAdapter(PaymentProvider.ADYEN, ROUTING_TEST.BACKUP_PRIORITY, [])
  ];

  it('uses the first available provider', async () => {
    const used: string[] = [];
    const result = await ProviderFailoverHelper.attempt({
      candidates: candidates() as unknown as IPaymentProvider[],
      run: ({ provider }) => {
        used.push(provider.providerName);
        return Promise.resolve(ROUTING_TEST.CHARGE_RESULT);
      }
    });

    expect(result).toBe(ROUTING_TEST.CHARGE_RESULT);
    expect(used).toEqual([PaymentProvider.STRIPE]);
  });

  it('skips a provider whose circuit is open and uses the next one', async () => {
    const [primary, backup] = candidates();
    primary?.trip();

    const used: string[] = [];
    await ProviderFailoverHelper.attempt({
      candidates: [primary, backup] as unknown as IPaymentProvider[],
      run: ({ provider }) => {
        used.push(provider.providerName);
        return Promise.resolve(ROUTING_TEST.CHARGE_RESULT);
      }
    });

    expect(used).toEqual([PaymentProvider.ADYEN]);
  });

  it('fails over when the first provider reports its circuit open', async () => {
    const used: string[] = [];

    await ProviderFailoverHelper.attempt({
      candidates: candidates() as unknown as IPaymentProvider[],
      run: ({ provider }) => {
        used.push(provider.providerName);
        if (provider.providerName === PaymentProvider.STRIPE) {
          return Promise.reject(new ProviderError({ category: ProviderErrorCategory.CIRCUIT_OPEN, message: 'open' }));
        }

        return Promise.resolve(ROUTING_TEST.CHARGE_RESULT);
      }
    });

    expect(used).toEqual([PaymentProvider.STRIPE, PaymentProvider.ADYEN]);
  });

  it.each([[ProviderErrorCategory.NETWORK], [ProviderErrorCategory.PROVIDER_DOWN], [ProviderErrorCategory.UNKNOWN]])(
    'does not fail over on %s, because the money may already have moved',
    async category => {
      const used: string[] = [];

      await expect(
        ProviderFailoverHelper.attempt({
          candidates: candidates() as unknown as IPaymentProvider[],
          run: ({ provider }) => {
            used.push(provider.providerName);
            return Promise.reject(new ProviderError({ category, message: category }));
          }
        })
      ).rejects.toThrow();

      expect(used).toEqual([PaymentProvider.STRIPE]);
    }
  );

  it('does not fail over on a decline either', async () => {
    const used: string[] = [];

    await expect(
      ProviderFailoverHelper.attempt({
        candidates: candidates() as unknown as IPaymentProvider[],
        run: ({ provider }) => {
          used.push(provider.providerName);
          return Promise.reject(new ProviderError({ category: ProviderErrorCategory.DECLINED, message: 'declined' }));
        }
      })
    ).rejects.toThrow();

    expect(used).toEqual([PaymentProvider.STRIPE]);
  });
});
