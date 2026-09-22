import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, PaymentStatus } from '@common/libs';

import { PaymentDto } from '../dtos/payment/payment.dto';
import { InternalPaymentRecordDto } from '../dtos/payment/internal-payment.dto';
import { FindByProviderChargeIdDto } from '../dtos/repository/find-by-provider-charge-id.dto';
import { FindPaymentByIdempotencyKeyDto } from '../dtos/repository/find-payment-by-idempotency-key.dto';
import { UpdatePaymentStatusDto } from '../dtos/repository/update-payment-status.dto';
import { PAYMENT_TRANSITIONS } from '../constants/status/payment-transitions.constant';
import { PAYMENT_FAILURE_CODES } from '../constants/operations/payment-failure-codes.constant';

@Injectable()
export class PaymentRepository extends BaseExtendedRepository<PaymentDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'payments',
      columnMappings: {
        idempotencyKey: 'idempotency_key',
        userId: 'user_id',
        walletId: 'wallet_id',
        paymentMethodId: 'payment_method_id',
        amountMinor: 'amount_minor',
        feeMinor: 'fee_minor',
        provider: 'provider',
        providerChargeId: 'provider_charge_id',
        ledgerTransactionId: 'ledger_transaction_id',
        metadata: 'metadata',
        failureCode: 'failure_code',
        failureReason: 'failure_reason',
        authorizedAt: 'authorized_at',
        completedAt: 'completed_at',
        failedAt: 'failed_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'idempotencyKey',
      'userId',
      'walletId',
      'paymentMethodId',
      'type',
      'amountMinor',
      'feeMinor',
      'currency',
      'status',
      'provider',
      'providerChargeId',
      'ledgerTransactionId',
      'metadata',
      'failureCode',
      'failureReason',
      'authorizedAt',
      'completedAt',
      'failedAt',
      'createdAt',
      'updatedAt'
    ];
  }

  async findByIdempotencyKey ({ userId, idempotencyKey }: FindPaymentByIdempotencyKeyDto): Promise<PaymentDto | null> {
    return this.findOne({ where: { user_id: userId, idempotency_key: idempotencyKey } });
  }

  async findByProviderChargeId ({ provider, providerChargeId, adapter }: FindByProviderChargeIdDto): Promise<PaymentDto | null> {
    return this.findOne({ where: { provider, provider_charge_id: providerChargeId }, ...(adapter && { adapter }) });
  }

  async createPayment (dto: InternalPaymentRecordDto): Promise<PaymentDto | null> {
    return this.create({ data: dto });
  }

  async updatePaymentStatus (dto: UpdatePaymentStatusDto): Promise<PaymentDto | null> {
    const { paymentId, adapter, ...update } = dto;
    const now = new Date().toISOString();

    const derived = {
      ...(update.status === PaymentStatus.COMPLETED && { completedAt: now }),
      ...(update.status === PaymentStatus.FAILED && { failedAt: now, failureCode: update.failureCode ?? PAYMENT_FAILURE_CODES.DEFAULT })
    };

    return this.updateWhere({
      where: { id: paymentId, status: [...PAYMENT_TRANSITIONS[update.status]] },
      data: { ...update, ...derived } as Partial<PaymentDto>,
      ...(adapter && { adapter })
    });
  }
}
