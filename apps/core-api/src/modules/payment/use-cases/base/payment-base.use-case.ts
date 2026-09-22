import { BadRequestException, Inject, InternalServerErrorException } from '@nestjs/common';
import {
  AnalyticsEventTopic,
  EXTRACT_ID_KEY,
  KAFKA_SERVICE,
  KafkaPublish,
  KafkaService,
  PaymentCapability,
  PaymentProviderRegistry,
  PaymentStatus,
  PaymentType,
  WalletStatus
} from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentMethodRepository } from '../../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../../wallet/wallet.service';
import { ProcessPaymentDto } from '../../dtos/input/process-payment.dto';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { PaymentAnalyticsEventPayloadDto } from '../../dtos/analytics/payment-analytics-event.dto';
import { PaymentHelper } from '../../helpers/payment.helper';
import { PaymentOperationHelper } from '../../helpers/payment-operation.helper';
import { WalletHelper } from '../../../wallet/helpers/wallet.helper';
import { CreatePaymentRecordDto } from '../../dtos/step/create-payment-record.dto';
import { DispatchPaymentOperationDto } from '../../dtos/step/dispatch-payment-operation.dto';
import { ValidateWalletDto } from '../../dtos/step/validate-wallet.dto';
import { CompletePaymentUseCase } from '../commands/complete-payment.use-case';

export abstract class PaymentBaseUseCase {
  protected abstract readonly paymentType: PaymentType;

  @Inject(WalletService)
  protected readonly walletService!: WalletService;

  @Inject(PaymentRepository)
  protected readonly paymentRepository!: PaymentRepository;

  @Inject(PaymentMethodRepository)
  protected readonly paymentMethodRepository!: PaymentMethodRepository;

  @Inject(CompletePaymentUseCase)
  protected readonly completePayment!: CompletePaymentUseCase;

  @Inject(PaymentProviderRegistry)
  protected readonly providerRegistry!: PaymentProviderRegistry;

  @Inject(KAFKA_SERVICE)
  protected readonly [KAFKA_SERVICE]!: KafkaService;

  protected abstract validateWallet(dto: ValidateWalletDto): void;

  @KafkaPublish({ topic: AnalyticsEventTopic.PAYMENT_COMPLETED, key: ({ result }) => EXTRACT_ID_KEY({ result, field: 'paymentId' }) })
  protected async publishPaymentCompleted (eventPayload: PaymentAnalyticsEventPayloadDto): Promise<PaymentAnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  @KafkaPublish({ topic: AnalyticsEventTopic.PAYMENT_FAILED, key: ({ result }) => EXTRACT_ID_KEY({ result, field: 'paymentId' }) })
  protected async publishPaymentFailed (eventPayload: PaymentAnalyticsEventPayloadDto): Promise<PaymentAnalyticsEventPayloadDto> {
    return Promise.resolve(eventPayload);
  }

  async execute (dto: ProcessPaymentDto): Promise<PaymentDto> {
    const { userId } = dto;

    const existing = await this.paymentRepository.findByIdempotencyKey({ userId, idempotencyKey: dto.idempotencyKey });
    if (existing) return existing;

    const userWallet = await this.walletService.getWalletByCurrency({ userId, currency: dto.currency });
    if (!userWallet) throw new BadRequestException(`You don't have a ${dto.currency} wallet`);
    WalletHelper.assertWalletStatus({ status: userWallet.status, allowedStatuses: [WalletStatus.ACTIVE] });
    this.validateWallet({ wallet: userWallet, dto });

    const method = await PaymentHelper.validateAndGetPaymentMethod({
      userId,
      paymentMethodId: dto.paymentMethodId,
      paymentMethodRepository: this.paymentMethodRepository
    });

    const payment = await this.createPaymentRecord({ wallet: userWallet, dto, provider: method.provider });
    const updated = await this.dispatchPaymentOperation({ payment, dto, userWallet, method });

    PaymentHelper.emitCompletedAnalytics({
      payment: updated,
      publishPaymentCompleted: payload => this.publishPaymentCompleted(payload),
      publishPaymentFailed: payload => this.publishPaymentFailed(payload)
    });

    return updated;
  }

  private async createPaymentRecord ({ wallet, dto, provider }: CreatePaymentRecordDto): Promise<PaymentDto> {
    const payment = await this.paymentRepository.createPayment({
      ...dto,
      walletId: wallet.id,
      type: this.paymentType,
      status: PaymentStatus.PENDING,
      provider
    });

    if (!payment) throw new InternalServerErrorException('Failed to create payment record');
    return payment;
  }

  private async dispatchPaymentOperation ({ payment, dto, userWallet, method }: DispatchPaymentOperationDto): Promise<PaymentDto> {
    const base = {
      payment,
      dto,
      userWallet,
      method,
      walletService: this.walletService,
      paymentRepository: this.paymentRepository,
      completePayment: this.completePayment
    };

    if (this.paymentType === PaymentType.DEPOSIT) {
      const provider = this.providerRegistry.require({ providerName: method.provider, capability: PaymentCapability.CHARGE });
      return PaymentOperationHelper.executeDepositOperation({ ...base, provider });
    }

    const provider = this.providerRegistry.require({ providerName: method.provider, capability: PaymentCapability.PAYOUT });
    return PaymentOperationHelper.executeWithdrawalOperation({ ...base, provider });
  }
}
