import { PaymentMethodHelper } from '../../../src/app/features/profile/payment-methods/helpers/payment-method.helper';
import { aPaymentMethod } from '../../fakes/payment-method.fake';
import { REMOVAL_PROMPT_SPEC as R } from '../../constants/removal-prompt.constant';

describe('PaymentMethodHelper.removalPrompt', () => {
  it('names the card brand and last four digits so the user knows what they are removing', () => {
    const card = aPaymentMethod({ cardBrand: R.VISA, lastFour: R.LAST_FOUR, type: R.CARD_TYPE });

    expect(PaymentMethodHelper.removalPrompt({ method: card })).toBe(R.CARD_PROMPT);
  });

  it('falls back to the bank name when there is no card number', () => {
    const bank = aPaymentMethod({ bankName: R.BANK, type: R.BANK_TYPE, lastFour: null });

    expect(PaymentMethodHelper.removalPrompt({ method: bank })).toBe(R.BANK_PROMPT);
  });
});
