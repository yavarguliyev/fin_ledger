import PDFDocument from 'pdfkit';

import { RECEIPT } from '../constants/receipt/receipt.constant';
import { RECEIPT_LAYOUT } from '../constants/receipt/receipt-layout.constant';
import { ReceiptDto } from '../dtos/receipt/receipt.dto';
import { ReceiptRefDto } from '../dtos/receipt/receipt-ref.dto';
import { ReceiptSourceDto } from '../dtos/receipt/receipt-source.dto';
import { ReceiptLayoutHelper } from './receipt-layout.helper';

export class ReceiptHelper {
  static fromPayment ({ payment, customerName, cardBrand, lastFour }: ReceiptSourceDto): ReceiptDto {
    const money = new Intl.NumberFormat(RECEIPT.MONEY_LOCALE, { style: RECEIPT.CURRENCY_STYLE, currency: payment.currency });
    const amount = money.format(payment.amountMinor / RECEIPT.DECIMAL_BASE ** (money.resolvedOptions().maximumFractionDigits ?? 0));
    const brand = cardBrand ? cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1) : null;
    const method = lastFour ? [brand, `${RECEIPT.MASK}${lastFour}`].filter(Boolean).join(RECEIPT.SPACE) : RECEIPT.UNKNOWN_METHOD;
    const dates = new Intl.DateTimeFormat(RECEIPT.LOCALE, { dateStyle: RECEIPT.DATE_STYLE, timeStyle: RECEIPT.TIME_STYLE, timeZone: RECEIPT.TIME_ZONE });

    return {
      receiptNumber: `${RECEIPT.NUMBER_PREFIX}${payment.id.replace(RECEIPT.ID_SEPARATOR, RECEIPT.EMPTY).slice(0, RECEIPT.NUMBER_LENGTH).toUpperCase()}`,
      issuedAt: `${dates.format(payment.updatedAt)}${RECEIPT.SPACE}${RECEIPT.TIME_ZONE}`,
      generatedAt: `${dates.format(new Date())}${RECEIPT.SPACE}${RECEIPT.TIME_ZONE}`,
      typeLabel: RECEIPT.TYPE_LABELS[payment.type] ?? payment.type,
      amountLabel: RECEIPT.AMOUNT_LABELS[payment.type] ?? RECEIPT.DEFAULT_AMOUNT_LABEL,
      amount,
      method,
      status: payment.status,
      customerName,
      paymentId: payment.id,
      providerReference: payment.providerChargeId ?? null
    };
  }

  static async toPdf ({ receipt }: ReceiptRefDto): Promise<Buffer> {
    const document = new PDFDocument({ size: RECEIPT_LAYOUT.PAGE_SIZE, margin: 0, info: { Title: `${RECEIPT.BRAND} ${receipt.receiptNumber}` } });
    const chunks: Buffer[] = [];
    const done = new Promise<Buffer>((resolve, reject) => {
      document.on(RECEIPT.DATA_EVENT, (chunk: Buffer) => chunks.push(chunk));
      document.on(RECEIPT.END_EVENT, () => resolve(Buffer.concat(chunks)));
      document.on(RECEIPT.ERROR_EVENT, reject);
    });

    ReceiptLayoutHelper.header({ document, receipt });
    ReceiptLayoutHelper.amount({ document, receipt });
    ReceiptLayoutHelper.details({ document, receipt });
    ReceiptLayoutHelper.footer({ document, receipt });
    document.end();

    return done;
  }
}
