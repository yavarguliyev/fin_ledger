import { BadRequestException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { PaymentStatus, ProviderChargeStatus } from '@common/libs';

import { ExecuteDepositOperationDto } from '../dtos/helper/execute-deposit-operation.dto';
import { ExecuteWithdrawalOperationDto } from '../dtos/helper/execute-withdrawal-operation.dto';
import { MarkCompletedDto } from '../dtos/helper/mark-completed.dto';
import { MarkIndeterminateDto } from '../dtos/helper/mark-indeterminate.dto';
import { FailWithdrawalDto } from '../dtos/helper/fail-withdrawal.dto';
import { IdempotencyHelper, PaymentOperation } from './idempotency.helper';
import { PaymentDto } from '../dtos/payment/payment.dto';

export class PaymentOperationHelper {
  private static async markIndeterminate ({ paymentRepository, paymentId, charge }: MarkIndeterminateDto): Promise<void> {
    await paymentRepository.updatePaymentStatus({
      paymentId,
      status: PaymentStatus.REQUIRES_ACTION,
      failureReason: charge.failureReason ?? 'Provider outcome unconfirmed',
      ...(charge.failure ? { failureCode: charge.failure.code } : {})
    });
  }

  private static async markCompleted (options: MarkCompletedDto): Promise<PaymentDto> {
    const { paymentRepository, paymentId, providerChargeId, ledgerTransactionId } = options;

    const updated = await paymentRepository.updatePaymentStatus({
      paymentId,
      status: PaymentStatus.COMPLETED,
      ...(providerChargeId && { providerChargeId }),
      ledgerTransactionId
    });

    if (!updated) throw new InternalServerErrorException('Failed to update payment status');
    return updated;
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

    if (charge.status === ProviderChargeStatus.INDETERMINATE) {
      await PaymentOperationHelper.markIndeterminate({ paymentRepository, paymentId: payment.id, charge });
      throw new ServiceUnavailableException('Payment outcome is unconfirmed and is awaiting reconciliation');
    }

    if (charge.status !== ProviderChargeStatus.SUCCEEDED) {
      const failureReason = charge.failureReason ?? 'Payment charge was declined';
      await paymentRepository.updatePaymentStatus({ paymentId: payment.id, status: PaymentStatus.FAILED, failureReason });
      throw new BadRequestException(failureReason);
    }

    let ledgerTransactionId: string;

    try {
      ({ ledgerTransactionId } = await walletService.creditWallet({
        walletId: userWallet.id,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        transactionId: payment.id,
        reference: `deposit: ${payment.id}`
      }));
    } catch (err) {
      if (charge.chargeId) {
        await provider.refund({
        chargeId: charge.chargeId,
        amount: dto.amountMinor,
        currency: dto.currency,
        idempotencyKey: IdempotencyHelper.forPayment(PaymentOperation.REFUND, payment.id)
      });
      }

      await paymentRepository.updatePaymentStatus({ paymentId: payment.id, status: PaymentStatus.COMPENSATED });
      throw err;
    }

    return PaymentOperationHelper.markCompleted({ paymentRepository, paymentId: payment.id, providerChargeId: charge.chargeId, ledgerTransactionId });
  }

  public static async executeWithdrawalOperation (options: ExecuteWithdrawalOperationDto): Promise<PaymentDto> {
    const { payment, dto, userWallet, method, provider, walletService, paymentRepository } = options;
    const { amountMinor, currency, idempotencyKey } = dto;
    const { id: walletId } = userWallet;
    const { id: paymentId } = payment;
    const failure = { walletService, paymentRepository, walletId, amountMinor, paymentId };

    await walletService.reserveFunds({ walletId, amountMinor });

    let payout;
    try {
      payout = await provider.payout({
        amount: amountMinor,
        currency,
        recipientToken: method.providerMethodId!,
        idempotencyKey,
        description: `Withdrawal: ${paymentId}`
      });
    } catch (error) {
      await PaymentOperationHelper.failWithdrawal({ ...failure, reason: error instanceof Error ? error.message : 'Withdrawal payout failed' });
      throw error;
    }

    if (payout.status === ProviderChargeStatus.INDETERMINATE) {
      await PaymentOperationHelper.markIndeterminate({ paymentRepository, paymentId, charge: payout });
      throw new ServiceUnavailableException('Withdrawal outcome is unconfirmed and is awaiting reconciliation');
    }

    if (payout.status !== ProviderChargeStatus.SUCCEEDED) {
      const reason = payout.failureReason ?? 'Withdrawal payout was declined';
      await PaymentOperationHelper.failWithdrawal({ ...failure, reason });
      throw new BadRequestException(reason);
    }

    const { ledgerTransactionId } = await walletService.captureReservedFunds({
      walletId,
      amountMinor,
      currency,
      transactionId: paymentId,
      reference: `withdrawal: ${paymentId}`
    });

    return PaymentOperationHelper.markCompleted({ paymentRepository, paymentId, providerChargeId: payout.chargeId, ledgerTransactionId });
  }

  private static async failWithdrawal (dto: FailWithdrawalDto): Promise<void> {
    const { walletService, paymentRepository, walletId, amountMinor, paymentId, reason } = dto;

    await walletService.releaseFunds({ walletId, amountMinor });
    await paymentRepository.updatePaymentStatus({ paymentId, status: PaymentStatus.FAILED, failureReason: reason });
  }
}
