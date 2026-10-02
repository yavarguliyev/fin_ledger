import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

import { PAYMENT_RECEIPT_TEST as T } from '../constants/payment-receipt.constant';
import { ApiHelper } from './api.helper';
import { DbHelper } from './db.helper';
import { CreatedPayment } from '../interfaces/created-payment.interface';
import { TestPaymentRequest } from '../interfaces/test-payment.interface';

export class TestPaymentHelper {
  static async create ({ email, walletId, currency, methodId, status = T.PENDING }: TestPaymentRequest): Promise<CreatedPayment> {
    const chargeId = `${T.CHARGE_PREFIX}${randomUUID()}`;
    const [row] = await DbHelper.query<{ id: string }>({ sql: T.PAYMENT_SQL, params: [randomUUID(), email, walletId, methodId, currency, status, chargeId] });
    return { id: row?.id as string, chargeId };
  }

  static async complete (request: TestPaymentRequest): Promise<string> {
    const { id, chargeId } = await TestPaymentHelper.create({ ...request, status: T.PROCESSING });
    const event = { id: `${T.EVENT_PREFIX}${randomUUID()}`, type: T.SUCCEEDED, data: { object: { id: chargeId, metadata: {} } } };
    await ApiHelper.request({ method: 'POST', path: T.WEBHOOK_PATH, body: event });

    for (let attempt = 0; attempt < T.POLL_LIMIT; attempt += 1) {
      const [row] = await DbHelper.query<{ status: string }>({ sql: T.STATUS_SQL, params: [id] });
      if (row?.status === T.COMPLETED) return id;
      await delay(T.POLL_MS);
    }

    throw new Error(`Payment ${id} did not complete`);
  }
}
