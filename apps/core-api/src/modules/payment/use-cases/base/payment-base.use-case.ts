import { Inject, Injectable } from '@nestjs/common';
import {
  AnalyticsEventTopic,
  EXTRACT_ID_KEY,
  getSessionUser,
  KAFKA_SERVICE,
  KafkaPublish,
  KafkaService,
  OutboxRepository,
  PaymentType,
  PostgresService
} from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { RequestPayment, RequestPaymentDto } from '../../dtos/request/request-payment.dto';
import { WalletSummaryDto } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { PaymentAnalyticsEventPayloadDto } from '../../dtos/analytics/payment-analytics-event.dto';
import { emitKafkaPaymentAnalytics } from '../../../analytics/helpers/payment/emit-kafka-payment-analytics.helper';
import { processPaymentTransaction } from '../../helpers/processing/process-payment-transaction.helper';

@Injectable()
export abstract class PaymentBaseUseCase<TInput, TOutput> {
  protected abstract readonly paymentType: PaymentType;
  protected readonly [KAFKA_SERVICE]: KafkaService;

  constructor (
    protected readonly postgresService: PostgresService,
    protected readonly walletService: WalletService,
    protected readonly paymentRepository: PaymentRepository,
    protected readonly paymentMethodRepository: PaymentMethodRepository,
    protected readonly outboxRepository: OutboxRepository,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    this[KAFKA_SERVICE] = kafkaService;
  }

  protected abstract validateWallet(wallet: WalletSummaryDto, dto: RequestPaymentDto): void;
  protected abstract execute(input: TInput): Promise<TOutput>;

  @KafkaPublish({ topic: AnalyticsEventTopic.PAYMENT_COMPLETED, key: (result: unknown) => EXTRACT_ID_KEY(result, 'paymentId') })
  protected async publishPaymentCompleted (eventPayload: PaymentAnalyticsEventPayloadDto): Promise<PaymentAnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  @KafkaPublish({ topic: AnalyticsEventTopic.PAYMENT_FAILED, key: (result: unknown) => EXTRACT_ID_KEY(result, 'paymentId') })
  protected async publishPaymentFailed (eventPayload: PaymentAnalyticsEventPayloadDto): Promise<PaymentAnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  protected async processPayment ({ context, dto }: RequestPayment): Promise<PaymentDto> {
    const { userId } = getSessionUser(context);

    const existing = await this.paymentRepository.findByIdempotencyKey(dto.idempotencyKey);
    if (existing) return existing;

    const result = await this.postgresService.getWriteConnection().transaction(tx =>
      processPaymentTransaction({
        userId,
        dto,
        tx,
        paymentType: this.paymentType,
        paymentRepository: this.paymentRepository,
        paymentMethodRepository: this.paymentMethodRepository,
        walletService: this.walletService,
        outboxRepository: this.outboxRepository,
        validateWallet: this.validateWallet.bind(this)
      })
    );

    const { eventPayload: payload, isCompleted, updated } = result;

    void emitKafkaPaymentAnalytics({
      ...payload,
      isCompleted,
      publishPaymentCompleted: payload => this.publishPaymentCompleted(payload),
      publishPaymentFailed: payload => this.publishPaymentFailed(payload)
    });

    return updated;
  }
}
