import { PaymentCapability, ProviderChargeStatus } from '@common/shared-libs';

import { ProviderContractOptionsDto } from '../modules/dtos/testing/provider-contract-options.dto';
import { CHARGE_INPUT } from '../modules/constants/testing/charge-input.constant';
import { REQUIRED_METHODS } from '../modules/constants/testing/required-methods.constant';

const describeCapabilities = ({ create, expectedCapabilities }: ProviderContractOptionsDto): void => {
  it('declares a provider name and at least one capability', () => {
    const provider = create();

    expect(provider.providerName).toBeTruthy();
    expect(provider.capabilities.length).toBeGreaterThan(0);
  });

  it('reports supports() consistently with its declared capabilities', () => {
    const provider = create();

    Object.values(PaymentCapability).forEach(capability => {
      expect(provider.supports({ capability })).toBe(provider.capabilities.includes(capability));
    });
  });

  it('implements every method its capabilities promise', () => {
    const provider = create();
    const methods = provider as unknown as Record<string, unknown>;

    provider.capabilities.forEach(capability => {
      REQUIRED_METHODS[capability].forEach(method => expect(typeof methods[method]).toBe('function'));
    });
  });

  if (!expectedCapabilities) return;

  it('declares exactly the expected capabilities', () => {
    expect([...create().capabilities].sort()).toEqual([...expectedCapabilities].sort());
  });
};

const describeBehaviour = ({ create }: ProviderContractOptionsDto): void => {
  it('never throws raw errors out of charge; failures come back classified', async () => {
    const provider = create();
    if (!provider.supports({ capability: PaymentCapability.CHARGE })) return;

    const charger = provider as unknown as { charge: (dto: unknown) => Promise<Record<string, unknown>> };
    const charge = await charger.charge(CHARGE_INPUT);
    const failure = charge['failure'] as { indeterminate: boolean } | undefined;

    expect(charge['chargeId']).toBeTruthy();
    expect(Object.values(ProviderChargeStatus)).toContain(charge['status']);

    const settledAsFailure = charge['status'] === ProviderChargeStatus.FAILED || charge['status'] === ProviderChargeStatus.INDETERMINATE;
    if (!settledAsFailure) return;

    expect(failure).toBeDefined();
    expect(failure?.indeterminate).toBe(charge['status'] === ProviderChargeStatus.INDETERMINATE);
  });

  it('rejects an unsigned webhook unless it is explicitly simulated', async () => {
    const provider = create();
    if (!provider.supports({ capability: PaymentCapability.WEBHOOKS })) return;

    const hooks = provider as unknown as {
      extractSignature: (dto: { headers: Record<string, string> }) => string;
      constructWebhookEvent: (dto: { payload: string; signature: string }) => Promise<{ signatureVerified: boolean }>;
    };

    expect(typeof hooks.extractSignature({ headers: {} })).toBe('string');

    const event = await hooks.constructWebhookEvent({ payload: JSON.stringify({ id: 'evt_1', type: 'test' }), signature: '' }).catch(() => null);
    if (event) expect(event.signatureVerified).toBe(false);
  });
};

export const runProviderContractTests = (options: ProviderContractOptionsDto): void => {
  describe(`${options.name} payment provider contract`, () => {
    describeCapabilities(options);
    describeBehaviour(options);
  });
};
