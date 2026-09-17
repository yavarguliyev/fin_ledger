import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DomainEventType, PaymentMethodStatus, PaymentStatus, ProviderChargeStatus } from '@common/libs';
import { v7 as uuid } from 'uuid';

import {
  ExecuteDepositOperationDto,
  ExecuteWithdrawalOperationDto,
  PublishPaymentEventsDto,
  RevertWithdrawalDto,
  ValidateAndGetPaymentMethodDto
} from '../dtos/payment-helper.dto';
import { PaymentMethodDto } from '../../payment-methods/dtos/payment-method/payment-method.dto';
import { PaymentDto } from '../dtos/payment/payment.dto';
import { AnalyticsHelper } from '../../analytics/helpers/analytics.helper';

export class PaymentHelper {
  public static async validateAndGetPaymentMethod (dto: ValidateAndGetPaymentMethodDto): Promise<PaymentMethodDto> {
    const { userId, paymentMethodId, paymentMethodRepository } = dto;
    if (!paymentMethodId) throw new BadRequestException('Payment method is required');

    const method = await paymentMethodRepository.findByIdAndUserId(paymentMethodId, userId);
    if (!method) throw new BadRequestException('Payment method not found or does not belong to user');
    if (method.status !== PaymentMethodStatus.VERIFIED) throw new BadRequestException('Selected payment method is not verified');
    if (!method.providerMethodId) throw new BadRequestException('Payment method token is missing');

    return method;
  }

  public static async executeDepositOperation (options: ExecuteDepositOperationDto): Promise<PaymentDto> {
    const { payment, dto, userWallet, method, provider, walletService, paymentRepository } = options;

    const charge = await provider.charge({
      amount: dto.amountMinor,
      currency: dto.currency,
      paymentMethodToken: method.providerMethodId!,
      idempotencyKey: dto.idempotencyKey,
      description: `Deposit: ${payment.id}`
    });

    if (charge.status !== ProviderChargeStatus.SUCCEEDED) {
      const failureReason = charge.failureReason ?? 'Payment charge was declined';
      await paymentRepository.updatePaymentStatus(payment.id, { status: PaymentStatus.FAILED, failureReason });
      throw new BadRequestException(failureReason);
    }

    try {
      await walletService.creditWallet({
        walletId: userWallet.id,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        transactionId: payment.id,
        reference: `deposit: ${payment.id}`
      });
    } catch (err) {
      if (charge.chargeId) {
        await provider.refund({ chargeId: charge.chargeId, amount: dto.amountMinor, currency: dto.currency, idempotencyKey: `refund_${payment.id}` });
      }

      await paymentRepository.updatePaymentStatus(payment.id, { status: PaymentStatus.COMPENSATED });
      throw err;
    }

    const updated = await paymentRepository.updatePaymentStatus(payment.id, {
      status: PaymentStatus.COMPLETED,
      providerChargeId: charge.chargeId,
      transactionId: payment.id
    });

    if (!updated) throw new InternalServerErrorException('Failed to update payment status');
    return updated;
  }

  public static async executeWithdrawalOperation (options: ExecuteWithdrawalOperationDto): Promise<PaymentDto> {
    const { payment, dto, userWallet, method, provider, walletService, paymentRepository } = options;
    const { amountMinor, currency, idempotencyKey } = dto;
    const { id: walletId } = userWallet;
    const { id: paymentId } = payment;

    await walletService.debitWallet({
      walletId,
      amountMinor: amountMinor,
      currency: currency,
      transactionId: payment.id,
      reference: `withdrawal: ${payment.id}`
    });

    let payout;
    try {
      payout = await provider.payout({
        amount: amountMinor,
        currency: currency,
        recipientToken: method.providerMethodId!,
        idempotencyKey: idempotencyKey,
        description: `Withdrawal: ${payment.id}`
      });
    } catch (err) {
      await PaymentHelper.revertWithdrawal({ walletService, paymentRepository, walletId, amountMinor, currency, paymentId, transactionId: uuid() });
      throw err;
    }

    if (payout.status !== ProviderChargeStatus.SUCCEEDED) {
      await PaymentHelper.revertWithdrawal({ walletService, paymentRepository, walletId, amountMinor, currency, paymentId, transactionId: uuid() });
      const reason = payout.failureReason ?? 'Withdrawal payout was declined';
      await paymentRepository.updatePaymentStatus(payment.id, { status: PaymentStatus.FAILED, failureReason: reason });
      throw new BadRequestException(reason);
    }

    const updated = await paymentRepository.updatePaymentStatus(payment.id, {
      status: PaymentStatus.COMPLETED,
      providerChargeId: payout.chargeId,
      transactionId: payment.id
    });

    if (!updated) throw new InternalServerErrorException('Failed to update payment status');
    return updated;
  }

  public static async publishPaymentEvents (options: PublishPaymentEventsDto): Promise<void> {
    const { payment, walletId, userId, dto, updated, paymentType, outboxRepository, publishPaymentCompleted, publishPaymentFailed } = options;

    const eventPayload = {
      paymentId: payment.id,
      userId,
      walletId,
      amountMinor: dto.amountMinor,
      currency: dto.currency,
      status: PaymentStatus.COMPLETED,
      paymentType,
      timestamp: new Date().toISOString(),
      providerTransactionId: updated.providerChargeId ?? ''
    };

    await outboxRepository.createEvent({
      aggregateType: 'Payment',
      aggregateId: payment.id,
      eventType: DomainEventType.PAYMENT_COMPLETED,
      payload: eventPayload
    });

    void AnalyticsHelper.emitKafkaPaymentAnalytics({ ...eventPayload, isCompleted: true, publishPaymentCompleted, publishPaymentFailed });
  }

  private static async revertWithdrawal (dto: RevertWithdrawalDto): Promise<void> {
    const { walletService, paymentRepository, walletId, amountMinor, currency, transactionId, paymentId } = dto;

    await walletService.creditWallet({ walletId, amountMinor, currency, transactionId, reference: `reversal:withdrawal: ${paymentId}` });
    await paymentRepository.updatePaymentStatus(paymentId, { status: PaymentStatus.COMPENSATED });
  }
}
