import { PaymentCapability } from '@common/shared-libs';

export const REQUIRED_METHODS: Record<PaymentCapability, string[]> = {
  [PaymentCapability.CHARGE]: ['charge', 'refund', 'retrieveCharge', 'findChargeByMetadata', 'cancelCharge'],
  [PaymentCapability.PAYOUT]: ['payout'],
  [PaymentCapability.METHOD_VAULT]: ['verifyPaymentMethod'],
  [PaymentCapability.HOSTED_SETUP]: ['createSetupSession', 'retrieveSessionPaymentMethod'],
  [PaymentCapability.WEBHOOKS]: ['extractSignature', 'constructWebhookEvent']
};
