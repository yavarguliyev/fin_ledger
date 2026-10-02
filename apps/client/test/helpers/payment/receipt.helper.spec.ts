import { ReceiptHelper } from '../../../src/app/core/helpers/payment/receipt.helper';
import { RECEIPT_SPEC as R } from '../../constants/receipt.constant';

describe('ReceiptHelper', () => {
  it('reads the payment id from deposit and withdrawal references', () => {
    expect(ReceiptHelper.paymentIdFrom({ reference: `${R.DEPOSIT_PREFIX}${R.PAYMENT_ID}` })).toBe(R.PAYMENT_ID);
    expect(ReceiptHelper.paymentIdFrom({ reference: `${R.WITHDRAWAL_PREFIX}${R.PAYMENT_ID}` })).toBe(R.PAYMENT_ID);
  });

  it('offers no receipt for bets, empty references or a missing id', () => {
    expect(ReceiptHelper.paymentIdFrom({ reference: R.BET_REFERENCE })).toBeNull();
    expect(ReceiptHelper.paymentIdFrom({ reference: null })).toBeNull();
    expect(ReceiptHelper.paymentIdFrom({ reference: R.EMPTY_DEPOSIT })).toBeNull();
  });

  it('builds the download path and file name', () => {
    expect(ReceiptHelper.path({ paymentId: R.PAYMENT_ID })).toBe(R.PATH);
    expect(ReceiptHelper.fileName({ paymentId: R.PAYMENT_ID })).toBe(R.FILE);
  });
});
