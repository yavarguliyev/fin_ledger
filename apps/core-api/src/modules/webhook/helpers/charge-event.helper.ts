import { z } from 'zod';
import { UnknownRecord } from '@common/libs';

import { ChargeEventPayloadDto } from '../dtos/helper/charge-event-payload.dto';
import { ChargeEventObjectDto } from '../dtos/helper/charge-event-object.dto';
import { PAYMENT_METADATA_KEYS } from '../../payment/constants/operations/payment-metadata.constant';

export class ChargeEventHelper {
  static objectOf ({ payload }: ChargeEventPayloadDto): UnknownRecord {
    const data = ChargeEventHelper.recordOf(payload['data']) ?? payload;
    return ChargeEventHelper.recordOf(data['object']) ?? data;
  }

  static chargeIdOf ({ object }: ChargeEventObjectDto): string {
    return typeof object['id'] === 'string' ? object['id'] : '';
  }

  static paymentIdOf ({ object }: ChargeEventObjectDto): string | null {
    const paymentId = ChargeEventHelper.recordOf(object['metadata'])?.[PAYMENT_METADATA_KEYS.PAYMENT_ID];
    return z.uuid().safeParse(paymentId).success ? (paymentId as string) : null;
  }

  private static recordOf (value: unknown): UnknownRecord | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as UnknownRecord) : null;
  }
}
