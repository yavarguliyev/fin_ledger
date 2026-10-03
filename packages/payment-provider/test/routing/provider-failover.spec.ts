import { PaymentProvider, ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { ProviderFailoverHelper } from '../../src/modules/helpers/provider-failover.helper';
import { ROUTING_TEST } from '../constants/routing.constant';
import { StubAdapter } from '../stubs/stub.adapter';

const candidates = (): StubAdapter[] => [
  new StubAdapter(PaymentProvider.STRIPE, ROUTING_TEST.PRIMARY_PRIORITY, []),
  new StubAdapter(PaymentProvider.ADYEN, ROUTING_TEST.BACKUP_PRIORITY, [])
];

describe('ProviderFailoverHelper.attempt', () => {
  it('uses the first available provider', async () => {
    const used: string[] = [];
    const result = await ProviderFailoverHelper.attempt({
      candidates: candidates(),
      run: ({ provider }) => {
        used.push(provider.providerName);
        return Promise.resolve(ROUTING_TEST.CHARGE_RESULT);
      }
    });

    expect(result).toBe(ROUTING_TEST.CHARGE_RESULT);
    expect(used).toEqual([PaymentProvider.STRIPE]);
  });

  it('skips a provider whose circuit is open and uses the next one', async () => {
    const providers = candidates();
    providers[0]?.trip();

    const used: string[] = [];
    await ProviderFailoverHelper.attempt({
      candidates: providers,
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
      candidates: candidates(),
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
});

describe('ProviderFailoverHelper.attempt on errors', () => {
  it.each([[ProviderErrorCategory.NETWORK], [ProviderErrorCategory.PROVIDER_DOWN], [ProviderErrorCategory.UNKNOWN]])(
    'does not fail over on %s, because the money may already have moved',
    async category => {
      const used: string[] = [];

      await expect(
        ProviderFailoverHelper.attempt({
          candidates: candidates(),
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
        candidates: candidates(),
        run: ({ provider }) => {
          used.push(provider.providerName);
          return Promise.reject(new ProviderError({ category: ProviderErrorCategory.DECLINED, message: 'declined' }));
        }
      })
    ).rejects.toThrow();

    expect(used).toEqual([PaymentProvider.STRIPE]);
  });
});
