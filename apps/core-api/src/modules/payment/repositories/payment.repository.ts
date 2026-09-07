import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService, DatabaseAdapter } from '@common/libs';

import { PaymentUpdateDto } from '../dtos/payment/payment-update.dto';
import { PaymentDto } from '../dtos/payment/payment.dto';
import { InternalPaymentRecordDto } from '../dtos/payment/internal-payment.dto';

@Injectable()
export class PaymentRepository extends BaseRepository<PaymentDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'payments', {
      idempotencyKey: 'idempotency_key',
      userId: 'user_id',
      walletId: 'wallet_id',
      ledgerAccountId: 'ledger_account_id',
      paymentMethodId: 'payment_method_id',
      amountMinor: 'amount_minor',
      transactionId: 'transaction_id',
      metadata: 'metadata',
      failureReason: 'failure_reason',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'idempotencyKey',
      'userId',
      'walletId',
      'ledgerAccountId',
      'paymentMethodId',
      'type',
      'amountMinor',
      'currency',
      'status',
      'transactionId',
      'metadata',
      'failureReason',
      'createdAt',
      'updatedAt'
    ];
  }

  async findByIdempotencyKey (idempotencyKey: string, adapter?: DatabaseAdapter): Promise<PaymentDto | null> {
    return this.findOne({ idempotency_key: idempotencyKey }, adapter);
  }

  async createPayment (dto: InternalPaymentRecordDto, adapter?: DatabaseAdapter): Promise<PaymentDto | null> {
    return this.create(dto, undefined, adapter);
  }

  async updatePaymentStatus (paymentId: string, update: PaymentUpdateDto, adapter?: DatabaseAdapter): Promise<PaymentDto | null> {
    return this.update(paymentId, update as Partial<PaymentDto>, undefined, adapter);
  }
}
