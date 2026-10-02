import { PaymentCapability, PaymentProvider } from '@common/shared-libs';

import { PaymentProviderRegistry } from '../../src/modules/registry/payment-provider.registry';
import { ROUTING_TEST } from '../constants/routing.constant';
import { StubAdapter } from '../stubs/stub.adapter';

const register = (providers: StubAdapter[]): PaymentProviderRegistry => {
  const registry = new PaymentProviderRegistry();
  providers.forEach(provider => registry.register({ provider: provider }));

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
