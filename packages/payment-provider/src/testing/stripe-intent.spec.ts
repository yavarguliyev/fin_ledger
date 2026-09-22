import type Stripe from 'stripe';
import { PaymentIntent } from 'stripe';
import { ProviderChargeStatus, ProviderErrorCategory } from '@common/shared-libs';

import { StripeIntentHelper } from '../modules/adapters/stripe/helpers/stripe-intent.helper';
import { StripeOperationHelper } from '../modules/adapters/stripe/helpers/stripe-operation.helper';
import { STRIPE_INTENT_DEFAULTS } from '../modules/constants/stripe/stripe-intent-status.constant';
import { CHARGE_INPUT } from '../modules/constants/testing/charge-input.constant';

const intentOf = (fields: Partial<PaymentIntent>): PaymentIntent => ({ id: 'pi_test', client_secret: null, last_payment_error: null, ...fields }) as PaymentIntent;

describe('Stripe PaymentIntent status mapping', () => {
  it.each([
    ['succeeded', ProviderChargeStatus.SUCCEEDED],
    ['processing', ProviderChargeStatus.PENDING],
    ['requires_capture', ProviderChargeStatus.PENDING],
    ['requires_action', ProviderChargeStatus.REQUIRES_ACTION],
    ['requires_confirmation', ProviderChargeStatus.REQUIRES_ACTION],
    ['requires_payment_method', ProviderChargeStatus.FAILED],
    ['canceled', ProviderChargeStatus.FAILED],
    ['some_future_status', ProviderChargeStatus.INDETERMINATE]
  ])('maps %s to %s', (status, expected) => {
    expect(StripeIntentHelper.toOperationResult({ intent: intentOf({ status }) }).status).toBe(expected);
  });

  it('returns the client secret when the customer must act (3-D Secure)', () => {
    const result = StripeIntentHelper.toOperationResult({ intent: intentOf({ status: 'requires_action', client_secret: 'pi_test_secret_abc' }) });

    expect(result).toEqual({ id: 'pi_test', status: ProviderChargeStatus.REQUIRES_ACTION, clientSecret: 'pi_test_secret_abc' });
  });

  it('returns a definitive decline with the decline code', () => {
    const lastError = { type: 'card_error', code: 'card_declined', decline_code: 'insufficient_funds', message: 'Your card has insufficient funds.' };
    const { failure } = StripeIntentHelper.toOperationResult({
      intent: intentOf({ status: 'requires_payment_method', last_payment_error: lastError })
    });

    expect(failure).toMatchObject({
      code: 'insufficient_funds',
      category: ProviderErrorCategory.DECLINED,
      message: 'Your card has insufficient funds.',
      retryable: false,
      indeterminate: false
    });
  });

  it('describes a cancellation even without a payment error', () => {
    const { failure } = StripeIntentHelper.toOperationResult({ intent: intentOf({ status: 'canceled' }) });

    expect(failure).toMatchObject({ code: 'canceled', message: STRIPE_INTENT_DEFAULTS.FAILURE_MESSAGE, indeterminate: false });
  });

});

describe('StripeOperationHelper.createCharge', () => {
  it('sends our metadata to Stripe so webhooks can find the payment', async () => {
    const sent: unknown[] = [];
    const client = {
      paymentIntents: {
        create: async (params: unknown): Promise<PaymentIntent> => {
          sent.push(params);
          return Promise.resolve(intentOf({ status: 'succeeded' }));
        }
      }
    } as unknown as Stripe;

    await StripeOperationHelper.createCharge({ client, dto: { ...CHARGE_INPUT, metadata: { paymentId: 'payment-1' } } });

    expect(sent[0]).toMatchObject({ metadata: { paymentId: 'payment-1' } });
  });

  it('is what createCharge returns', async () => {
    const client = { paymentIntents: { create: async (): Promise<PaymentIntent> => Promise.resolve(intentOf({ status: 'processing' })) } } as unknown as Stripe;

    await expect(StripeOperationHelper.createCharge({ client, dto: CHARGE_INPUT })).resolves.toEqual({ id: 'pi_test', status: ProviderChargeStatus.PENDING });
  });
});

describe('StripeOperationHelper.retrieveCharge', () => {
  it('reads the PaymentIntent, and follows a charge ID to its PaymentIntent', async () => {
    const retrieved: string[] = [];
    const client = {
      charges: { retrieve: async (): Promise<unknown> => Promise.resolve({ payment_intent: 'pi_from_charge' }) },
      paymentIntents: {
        retrieve: async (id: string): Promise<PaymentIntent> => {
          retrieved.push(id);
          return Promise.resolve(intentOf({ id, status: 'succeeded', amount: 1500, currency: 'usd' }));
        }
      }
    } as unknown as Stripe;

    await expect(StripeOperationHelper.retrieveCharge({ client, dto: { chargeId: 'pi_direct' } })).resolves.toMatchObject({
      status: ProviderChargeStatus.SUCCEEDED,
      amount: 1500,
      currency: 'usd'
    });
    await StripeOperationHelper.retrieveCharge({ client, dto: { chargeId: 'ch_indirect' } });

    expect(retrieved).toEqual(['pi_direct', 'pi_from_charge']);
  });
});

describe('StripeOperationHelper.findIntentId', () => {
  it('searches PaymentIntents by our metadata and returns null when the provider never saw the payment', async () => {
    const queries: string[] = [];
    const clientReturning = (ids: string[]): Stripe =>
      ({
        paymentIntents: {
          search: async ({ query }: { query: string }): Promise<unknown> => {
            queries.push(query);
            return Promise.resolve({ data: ids.map(id => ({ id })) });
          }
        }
      }) as unknown as Stripe;
    const dto = { key: 'paymentId', value: '0192f3a4-0000-7000-8000-000000000001' };

    await expect(StripeOperationHelper.findIntentId({ client: clientReturning(['pi_found']), dto })).resolves.toBe('pi_found');
    await expect(StripeOperationHelper.findIntentId({ client: clientReturning([]), dto })).resolves.toBeNull();
    expect(queries[0]).toBe("metadata['paymentId']:'0192f3a4-0000-7000-8000-000000000001'");
  });
});

describe('StripeOperationHelper.cancelCharge', () => {
  it('cancels the PaymentIntent and reports it as a definitive failure', async () => {
    const cancelled: string[] = [];
    const client = {
      paymentIntents: {
        cancel: async (id: string): Promise<PaymentIntent> => {
          cancelled.push(id);
          return Promise.resolve(intentOf({ id, status: 'canceled', amount: 900, currency: 'usd' }));
        }
      }
    } as unknown as Stripe;

    await expect(StripeOperationHelper.cancelCharge({ client, dto: { chargeId: 'pi_abandoned' } })).resolves.toMatchObject({
      status: ProviderChargeStatus.FAILED,
      failure: { code: 'canceled', indeterminate: false }
    });
    expect(cancelled).toEqual(['pi_abandoned']);
  });
});
