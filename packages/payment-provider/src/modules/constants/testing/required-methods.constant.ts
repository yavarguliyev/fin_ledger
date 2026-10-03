import { PaymentCapability } from '@common/shared-libs';

import type { IPaymentProvider } from '../../types/payment-provider.type';

export const REQUIRED_METHODS: Record<PaymentCapability, (keyof IPaymentProvider)[]> = {
  [PaymentCapability.CHARGE]: ['charge', 'refund', 'retrieveCharge', 'findChargeByMetadata', 'cancelCharge'],
  [PaymentCapability.PAYOUT]: ['payout'],
  [PaymentCapability.METHOD_VAULT]: ['verifyPaymentMethod'],
  [PaymentCapability.HOSTED_SETUP]: ['createSetupSession', 'retrieveSessionPaymentMethod'],
  [PaymentCapability.WEBHOOKS]: ['extractSignature', 'constructWebhookEvent']
};
