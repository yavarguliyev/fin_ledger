import { PaymentCapability } from '@common/shared-libs';

export const STRIPE_ROUTING = {
  CAPABILITIES: [
    PaymentCapability.CHARGE,
    PaymentCapability.PAYOUT,
    PaymentCapability.METHOD_VAULT,
    PaymentCapability.HOSTED_SETUP,
    PaymentCapability.WEBHOOKS
  ] as readonly PaymentCapability[],

  CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD'] as readonly string[],
  COUNTRIES: [] as readonly string[],
  PRIORITY: 10
} as const;
