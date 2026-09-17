import { BadRequestException, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  AnalyticsEventTopic,
  EXTRACT_ID_KEY,
  KAFKA_SERVICE,
  KafkaPublish,
  KafkaService,
  OutboxRepository,
  PaymentProviderRegistry,
  PaymentStatus,
  PaymentType,
  PostgresService,
  SessionHelper
} from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { RequestPayment, RequestPaymentDto } from '../../dtos/request/request-payment.dto';
import { WalletSummaryDto } from '../../../wallet/dtos/wallet/wallet-summary.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { PaymentAnalyticsEventPayloadDto } from '../../dtos/analytics/payment-analytics-event.dto';
import { PaymentHelper } from '../../helpers/payment.helper';
import { CreatePaymentRecordDto, DispatchPaymentOperationDto } from '../../dtos/payment-helper.dto';

export abstract class PaymentBaseUseCase<TInput extends RequestPayment, TOutput extends PaymentDto> {
  protected abstract readonly paymentType: PaymentType;

  @Inject(PostgresService)
  protected readonly postgresService!: PostgresService;

  @Inject(WalletService)
  protected readonly walletService!: WalletService;

  @Inject(PaymentRepository)
  protected readonly paymentRepository!: PaymentRepository;

  @Inject(PaymentMethodRepository)
  protected readonly paymentMethodRepository!: PaymentMethodRepository;

  @Inject(OutboxRepository)
  protected readonly outboxRepository!: OutboxRepository;

  @Inject(PaymentProviderRegistry)
  protected readonly providerRegistry!: PaymentProviderRegistry;

  @Inject(KAFKA_SERVICE)
  protected readonly [KAFKA_SERVICE]!: KafkaService;

  protected abstract validateWallet(wallet: WalletSummaryDto, dto: RequestPaymentDto): void;

  @KafkaPublish({ topic: AnalyticsEventTopic.PAYMENT_COMPLETED, key: (result: unknown) => EXTRACT_ID_KEY(result, 'paymentId') })
  protected async publishPaymentCompleted (eventPayload: PaymentAnalyticsEventPayloadDto): Promise<PaymentAnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  @KafkaPublish({ topic: AnalyticsEventTopic.PAYMENT_FAILED, key: (result: unknown) => EXTRACT_ID_KEY(result, 'paymentId') })
  protected async publishPaymentFailed (eventPayload: PaymentAnalyticsEventPayloadDto): Promise<PaymentAnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  async execute (input: TInput): Promise<TOutput> {
    const { context, dto } = input;
    const { userId } = SessionHelper.getSessionUser({ context });

    const existing = await this.paymentRepository.findByIdempotencyKey(dto.idempotencyKey);
    if (existing) return existing as TOutput;

    const userWallet = await this.walletService.getWalletByUserId(userId);
    if (!userWallet) throw new BadRequestException('User wallet not found');
    this.validateWallet(userWallet, dto);

    const method = await PaymentHelper.validateAndGetPaymentMethod({
      userId,
      paymentMethodId: dto.paymentMethodId,
      paymentMethodRepository: this.paymentMethodRepository
    });

    const payment = await this.createPaymentRecord({ userId, wallet: userWallet, dto, provider: method.provider });
    const updated = await this.dispatchPaymentOperation({ payment, dto, userWallet, method });

    await PaymentHelper.publishPaymentEvents({
      payment,
      walletId: userWallet.id,
      userId,
      dto,
      updated,
      paymentType: this.paymentType,
      outboxRepository: this.outboxRepository,
      publishPaymentCompleted: payload => this.publishPaymentCompleted(payload),
      publishPaymentFailed: payload => this.publishPaymentFailed(payload)
    });

    return updated as TOutput;
  }

  private async createPaymentRecord ({ userId, wallet, dto, provider }: CreatePaymentRecordDto): Promise<PaymentDto> {
    const payment = await this.paymentRepository.createPayment({
      ...dto,
      userId,
      walletId: wallet.id,
      ledgerAccountId: wallet.ledgerAccountId!,
      type: this.paymentType,
      status: PaymentStatus.PENDING,
      provider
    });

    if (!payment) throw new InternalServerErrorException('Failed to create payment record');
    return payment;
  }

  private async dispatchPaymentOperation ({ payment, dto, userWallet, method }: DispatchPaymentOperationDto): Promise<PaymentDto> {
    const provider = this.providerRegistry.get(method.provider);
    const options = { payment, dto, userWallet, method, provider, walletService: this.walletService, paymentRepository: this.paymentRepository };

    return this.paymentType === PaymentType.DEPOSIT
      ? PaymentHelper.executeDepositOperation(options)
      : PaymentHelper.executeWithdrawalOperation(options);
  }
}
