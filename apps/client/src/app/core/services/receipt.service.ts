import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { RECEIPT } from '../constants/payment/receipt.constant';
import { ReceiptHelper } from '../helpers/payment/receipt.helper';
import { ReceiptDownloadDto } from '../interfaces/payment/receipt-download.interface';
import { ReceiptFileDto } from '../interfaces/payment/receipt-file.interface';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  load ({ paymentId }: ReceiptDownloadDto): Observable<string> {
    return this.http
      .get(`${this.config.apiUrl}${ReceiptHelper.path({ paymentId })}`, { responseType: RECEIPT.BLOB_TYPE })
      .pipe(map(blob => URL.createObjectURL(new Blob([blob], { type: RECEIPT.PDF_TYPE }))));
  }

  download ({ paymentId }: ReceiptDownloadDto): Observable<void> {
    return this.load({ paymentId }).pipe(
      map(url => {
        this.save({ paymentId, url });
        URL.revokeObjectURL(url);
      })
    );
  }

  save ({ paymentId, url }: ReceiptFileDto): void {
    const anchor = document.createElement(RECEIPT.ANCHOR);
    anchor.href = url;
    anchor.download = ReceiptHelper.fileName({ paymentId });
    anchor.click();
  }
}
