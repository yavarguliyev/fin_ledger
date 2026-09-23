import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AnalyticsEventTopic, DomainEventType, OutboxDestination, OutboxRepository, PaymentStatus, PaymentType, PostgresService } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { WalletOperationResultDto } from '../../../wallet/dtos/transaction/wallet-operation-result.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { CompletePaymentDto } from '../../dtos/input/complete-payment.dto';
import { CompletePaymentInTransactionDto } from '../../dtos/helper/complete-payment-in-transaction.dto';
import { MoveFundsDto } from '../../dtos/helper/move-funds.dto';
import { PaymentHelper } from '../../helpers/payment.helper';
import { PAYMENT_TRANSITIONS } from '../../constants/status/payment-transitions.constant';
import { PAYMENT_ERRORS } from '../../constants/errors/payment-errors.constant';
import { PAYMENT_LABELS } from '../../constants/operations/payment-labels.constant';

@Injectable()
export class CompletePaymentUseCase {
  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    @Inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly walletService: WalletService
  ) {}

  async execute (dto: CompletePaymentDto): Promise<PaymentDto> {
    if (dto.adapter) return this.complete({ ...dto, adapter: dto.adapter });

    return this.postgresService.getWriteConnection().transaction({ callback: async adapter => this.complete({ ...dto, adapter }) });
  }

  private async complete ({ paymentId, providerChargeId, adapter }: CompletePaymentInTransactionDto): Promise<PaymentDto> {
    const payment = await this.paymentRepository.findByIdForUpdate({ id: paymentId, adapter });
    if (!payment) throw new NotFoundException(PAYMENT_ERRORS.NOT_FOUND);
    if (!PAYMENT_TRANSITIONS[PaymentStatus.COMPLETED].includes(payment.status)) return payment;

    const { ledgerTransactionId } = await this.moveFunds({ payment, adapter });

    const completed = await this.paymentRepository.updatePaymentStatus({
      paymentId,
      status: PaymentStatus.COMPLETED,
      ledgerTransactionId,
      ...(providerChargeId && { providerChargeId }),
      adapter
    });
    if (!completed) throw new InternalServerErrorException(PAYMENT_ERRORS.STATUS_UPDATE_FAILED);

    const payload = PaymentHelper.completedEventPayload({ payment: completed });

    await this.outboxRepository.createEvent({ aggregateType: 'Payment', aggregateId: paymentId, eventType: DomainEventType.PAYMENT_COMPLETED, payload, adapter });
    await this.outboxRepository.createEvent({
      aggregateType: 'Payment',
      aggregateId: paymentId,
      eventType: AnalyticsEventTopic.PAYMENT_COMPLETED,
      payload,
      destination: OutboxDestination.KAFKA,
      adapter
    });

    return completed;
  }

  private async moveFunds ({ payment, adapter }: MoveFundsDto): Promise<WalletOperationResultDto> {
    const { id, walletId, amountMinor, currency, type } = payment;
    const operation = { walletId, amountMinor, currency, transactionId: id, adapter };

    if (type === PaymentType.DEPOSIT) {
      return this.walletService.creditWallet({ ...operation, reference: `${PAYMENT_LABELS.DEPOSIT.REFERENCE}${PAYMENT_LABELS.SEPARATOR}${id}` });
    }

    if (type === PaymentType.WITHDRAWAL) {
      return this.walletService.captureReservedFunds({ ...operation, reference: `${PAYMENT_LABELS.WITHDRAWAL.REFERENCE}${PAYMENT_LABELS.SEPARATOR}${id}` });
    }

    throw new InternalServerErrorException(PAYMENT_ERRORS.NOT_COMPLETABLE);
  }
}
