import { ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { THREE_DECIMAL_CURRENCIES } from '../../../constants/currency/three-decimal-currencies.constant';
import { AssertChargeableDto } from '../../../dtos/helper/assert-chargeable.dto';

export class StripeAmountHelper {
  static assertChargeable ({ amountMinor, currency }: AssertChargeableDto): void {
    const code = currency.toUpperCase();
    if (!THREE_DECIMAL_CURRENCIES.has(code)) return;

    if (amountMinor % 10 !== 0) {
      throw new ProviderError({
        message: `Stripe requires ${code} amounts to be a multiple of 10 of the smallest unit; received ${amountMinor}`,
        category: ProviderErrorCategory.INVALID_REQUEST,
        code: 'amount_precision_unsupported'
      });
    }
  }
}
