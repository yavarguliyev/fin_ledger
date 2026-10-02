import { RECEIPT } from '../../constants/payment/receipt.constant';
import { ReceiptDownloadDto } from '../../interfaces/payment/receipt-download.interface';
import { ReceiptReferenceDto } from '../../interfaces/payment/receipt-reference.interface';

export class ReceiptHelper {
  static paymentIdFrom ({ reference }: ReceiptReferenceDto): string | null {
    if (!reference) return null;
    const prefix = RECEIPT.REFERENCE_PREFIXES.find(candidate => reference.startsWith(candidate));
    return prefix ? reference.slice(prefix.length).trim() || null : null;
  }

  static path ({ paymentId }: ReceiptDownloadDto): string {
    return `${RECEIPT.PATH_PREFIX}${paymentId}${RECEIPT.PATH_SUFFIX}`;
  }

  static fileName ({ paymentId }: ReceiptDownloadDto): string {
    return `${RECEIPT.FILE_PREFIX}${paymentId}${RECEIPT.FILE_EXTENSION}`;
  }
}
