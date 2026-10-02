import { PAYMENT_RECEIPT_TEST as T } from '../constants/payment-receipt.constant';
import { PDF_TEXT } from '../constants/pdf-text.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PdfTextHelper } from '../helpers/pdf-text.helper';
import { TestPaymentHelper } from '../helpers/test-payment.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { TestPaymentRequest } from '../interfaces/test-payment.interface';

describe('Payment receipts', () => {
  let owner = '';
  let request: TestPaymentRequest;

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.OTHER_EMAIL] });
    owner = await ApiHelper.login({ email: T.OWNER_EMAIL });
    const [wallet] = await DbHelper.query<{ id: string; currency: string }>({ sql: T.WALLET_SQL, params: [T.OWNER_EMAIL] });
    const [method] = await DbHelper.query<{ id: string }>({ sql: T.METHOD_SQL, params: [T.OWNER_EMAIL] });
    request = { email: T.OWNER_EMAIL, walletId: wallet?.id as string, currency: wallet?.currency as string, methodId: method?.id as string };
  });

  afterAll(async () => DbHelper.close());

  it('streams a PDF receipt for a completed deposit with the amount and the masked card', async () => {
    const paymentId = await TestPaymentHelper.complete(request);
    const receipt = await ApiHelper.download({ path: T.RECEIPT_PATH(paymentId), token: owner });
    const text = PdfTextHelper.extract(receipt.bytes);

    expect(receipt.status).toBe(T.OK);
    expect(receipt.headers.get('content-type')).toContain(T.CONTENT_TYPE);
    expect(receipt.headers.get('content-disposition')).toContain(T.DISPOSITION_FRAGMENT);
    expect(receipt.bytes.toString(PDF_TEXT.BINARY).startsWith(PDF_TEXT.MAGIC)).toBe(true);
    expect(text).toContain(paymentId);
    expect(text).toContain(T.AMOUNT_TEXT);
    expect(text).toContain(T.BRAND);
    expect(text).toContain(T.LAST_FOUR);
  });

  it('gives another player a 404 for someone else’s receipt', async () => {
    const paymentId = await TestPaymentHelper.complete(request);
    const other = await ApiHelper.login({ email: T.OTHER_EMAIL });

    await expect(ApiHelper.download({ path: T.RECEIPT_PATH(paymentId), token: other })).resolves.toMatchObject({ status: T.NOT_FOUND });
  });

  it('offers no receipt for a payment that has not completed', async () => {
    const { id } = await TestPaymentHelper.create(request);

    await expect(ApiHelper.download({ path: T.RECEIPT_PATH(id), token: owner })).resolves.toMatchObject({ status: T.NOT_FOUND });
  });
});
