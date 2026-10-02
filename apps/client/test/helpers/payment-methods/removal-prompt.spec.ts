import { PaymentMethodHelper } from '../../../src/app/features/profile/payment-methods/helpers/payment-method.helper';
import { PaymentMethod } from '../../../src/app/core/types/payment-method/payment-method.type';
import { REMOVAL_PROMPT_SPEC as R } from '../../constants/removal-prompt.constant';

describe('PaymentMethodHelper.removalPrompt', () => {
  it('names the card brand and last four digits so the user knows what they are removing', () => {
    const card = { cardBrand: R.VISA, lastFour: R.LAST_FOUR, type: R.CARD_TYPE } as unknown as PaymentMethod;

    expect(PaymentMethodHelper.removalPrompt({ method: card })).toBe(R.CARD_PROMPT);
  });

  it('falls back to the bank name when there is no card number', () => {
    const bank = { bankName: R.BANK, type: R.BANK_TYPE } as unknown as PaymentMethod;

    expect(PaymentMethodHelper.removalPrompt({ method: bank })).toBe(R.BANK_PROMPT);
  });
});
