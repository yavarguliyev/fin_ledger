import { ConfigService } from '@nestjs/config';
import { ProviderErrorCategory, PaymentCapability } from '@common/shared-libs';

import { StripeAdapter } from '../modules/adapters/stripe/stripe.adapter';
import { StripeAmountHelper } from '../modules/adapters/stripe/helpers/stripe-amount.helper';
import { StripeErrorMapper } from '../modules/adapters/stripe/helpers/stripe-error.mapper.helper';
import { runProviderContractTests } from './provider-contract';

const configOf = (values: Record<string, string>): ConfigService => ({ get: (key: string) => values[key] }) as unknown as ConfigService;

const simulated = (): ConfigService => configOf({ NODE_ENV: 'development', PAYMENT_SIMULATION: 'true' });

runProviderContractTests({
  name: 'Stripe',
  create: () => new StripeAdapter(simulated()),
  expectedCapabilities: [
    PaymentCapability.CHARGE,
    PaymentCapability.PAYOUT,
    PaymentCapability.METHOD_VAULT,
    PaymentCapability.HOSTED_SETUP,
    PaymentCapability.WEBHOOKS
  ]
});

describe('StripeAdapter configuration', () => {
  it('refuses to start in production without credentials', () => {
    expect(() => new StripeAdapter(configOf({ NODE_ENV: 'production' }))).toThrow(/missing required configuration/i);
  });

  it('refuses to simulate in production even when opted in', () => {
    expect(() => new StripeAdapter(configOf({ NODE_ENV: 'production', PAYMENT_SIMULATION: 'true' }))).toThrow();
  });

  it('refuses a partial configuration, so webhooks can always be verified', () => {
    const partial = configOf({ NODE_ENV: 'development', PAYMENT_SIMULATION: 'true', STRIPE_SECRET_KEY: 'sk_test_x' });
    expect(() => new StripeAdapter(partial)).toThrow(/partially configured/i);
  });

  it('rejects an unsigned webhook once a webhook secret is configured', async () => {
    const adapter = new StripeAdapter(configOf({ NODE_ENV: 'development', STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_WEBHOOK_SECRET: 'whsec_x' }));
    await expect(adapter.constructWebhookEvent({ payload: '{}', signature: '' })).rejects.toThrow(/missing stripe webhook signature/i);
  });

  it('rejects a forged webhook signature', async () => {
    const adapter = new StripeAdapter(configOf({ NODE_ENV: 'development', STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_WEBHOOK_SECRET: 'whsec_x' }));
    await expect(adapter.constructWebhookEvent({ payload: '{}', signature: 't=1,v1=deadbeef' })).rejects.toThrow(/invalid stripe webhook signature/i);
  });

  it('reads the stripe signature header', () => {
    const adapter = new StripeAdapter(simulated());
    expect(adapter.extractSignature({ headers: { 'stripe-signature': 'sig_1' } })).toBe('sig_1');
    expect(adapter.extractSignature({ headers: {} })).toBe('');
  });
});

describe('StripeErrorMapper', () => {
  const classify = (type: string): ProviderErrorCategory => StripeErrorMapper.toProviderError({ error: Object.assign(new Error('x'), { type }) }).category;

  it('treats a declined card as a definitive failure', () => {
    const error = StripeErrorMapper.toProviderError({ error: Object.assign(new Error('declined'), { type: 'StripeCardError' }) });

    expect(error.category).toBe(ProviderErrorCategory.DECLINED);
    expect(error.indeterminate).toBe(false);
  });

  it('prefers the specific decline code over the generic card_declined', () => {
    const error = StripeErrorMapper.toProviderError({
      error: Object.assign(new Error('declined'), { type: 'StripeCardError', code: 'card_declined', decline_code: 'insufficient_funds' })
    });

    expect(error.code).toBe('insufficient_funds');
  });

  it('treats a network failure as indeterminate so it is never auto-compensated', () => {
    const error = StripeErrorMapper.toProviderError({ error: Object.assign(new Error('timeout'), { type: 'StripeConnectionError' }) });

    expect(error.category).toBe(ProviderErrorCategory.NETWORK);
    expect(error.indeterminate).toBe(true);
    expect(error.retryable).toBe(true);
  });

  it('maps the remaining stripe error types', () => {
    expect(classify('StripeInvalidRequestError')).toBe(ProviderErrorCategory.INVALID_REQUEST);
    expect(classify('StripeAuthenticationError')).toBe(ProviderErrorCategory.AUTHENTICATION);
    expect(classify('StripeRateLimitError')).toBe(ProviderErrorCategory.RATE_LIMIT);
    expect(classify('StripeAPIError')).toBe(ProviderErrorCategory.PROVIDER_DOWN);
    expect(classify('SomethingElse')).toBe(ProviderErrorCategory.UNKNOWN);
  });
});

describe('StripeAmountHelper', () => {
  it('rejects a three-decimal amount that is not a multiple of ten', () => {
    expect(() => StripeAmountHelper.assertChargeable({ amountMinor: 1234, currency: 'KWD' })).toThrow(/multiple of 10/i);
  });

  it('accepts a valid three-decimal amount and any two-decimal amount', () => {
    expect(() => StripeAmountHelper.assertChargeable({ amountMinor: 1230, currency: 'KWD' })).not.toThrow();
    expect(() => StripeAmountHelper.assertChargeable({ amountMinor: 1234, currency: 'USD' })).not.toThrow();
  });
});
