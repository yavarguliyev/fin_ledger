import { PaymentMethodHelper } from '../../../src/app/features/profile/payment-methods/helpers/payment-method.helper';
import { PaymentMethod } from '../../../src/app/core/types/payment-method/payment-method.type';
import { PAYMENT_METHOD_SPEC } from '../../constants/payment-methods.constant';
import { aPaymentMethod } from '../../fakes/payment-method.fake';

const method = (id: string, status: PaymentMethod['status'], isDefault = false): PaymentMethod => aPaymentMethod({ id, status, isDefault });

describe('PaymentMethodHelper.preferredVerified', () => {
  it('prefers the default method among the verified ones', () => {
    const methods = [
      method(PAYMENT_METHOD_SPEC.FIRST_ID, PAYMENT_METHOD_SPEC.VERIFIED),
      method(PAYMENT_METHOD_SPEC.SECOND_ID, PAYMENT_METHOD_SPEC.VERIFIED, true)
    ];

    expect(PaymentMethodHelper.preferredVerified({ methods })?.id).toBe(PAYMENT_METHOD_SPEC.SECOND_ID);
  });

  it('never preselects an unverified method, even when it is the default', () => {
    const methods = [
      method(PAYMENT_METHOD_SPEC.FIRST_ID, PAYMENT_METHOD_SPEC.PENDING, true),
      method(PAYMENT_METHOD_SPEC.SECOND_ID, PAYMENT_METHOD_SPEC.VERIFIED)
    ];

    expect(PaymentMethodHelper.preferredVerified({ methods })?.id).toBe(PAYMENT_METHOD_SPEC.SECOND_ID);
  });

  it('returns nothing when no method is verified', () => {
    const methods = [method(PAYMENT_METHOD_SPEC.THIRD_ID, PAYMENT_METHOD_SPEC.PENDING)];

    expect(PaymentMethodHelper.preferredVerified({ methods })).toBeUndefined();
  });
});
