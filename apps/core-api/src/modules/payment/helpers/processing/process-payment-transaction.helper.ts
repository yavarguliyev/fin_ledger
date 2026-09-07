import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PaymentStatus, PaymentType } from '@common/libs';

import { HandlePaymentResultDto } from '../../dtos/processing/handle-payment-result.dto';
import { CreateHandleOptionsInput, ExecuteWalletOperationInput, ProcessPaymentInput } from '../../dtos/request/request-payment.dto';
import { validatePaymentMethod } from '../validation/validate-payment-method.helper';
import { HandlePaymentOptionsDto } from '../../dtos/processing/handle-payment-options.dto';
import { processPaymentStatusUpdate } from '../base/payment-base.helper';

export const processPaymentTransaction = async (options: ProcessPaymentInput): Promise<HandlePaymentResultDto> => {
  const { userId, dto, tx, paymentRepository, paymentMethodRepository, walletService, outboxRepository, paymentType, validateWallet } = options;

  const userWallet = await walletService.getWalletByUserId(userId);
  if (!userWallet) throw new BadRequestException('User wallet not found');

  validateWallet(userWallet, dto);

  await validatePaymentMethod({ userId, dto, paymentMethodRepository });

  const payment = await paymentRepository.createPayment(
    {
      ...dto,
      userId,
      walletId: userWallet.id,
      ledgerAccountId: userWallet.ledgerAccountId!,
      type: paymentType,
      status: PaymentStatus.PENDING
    },
    tx
  );

  if (!payment) throw new InternalServerErrorException('Failed to create payment record');

  await executeWalletOperation({
    walletService,
    walletId: userWallet.id,
    amountMinor: dto.amountMinor,
    currency: dto.currency,
    paymentId: payment.id,
    paymentType,
    tx
  });

  const handleOptions = createHandleOptions({ paymentId: payment.id, userId, walletId: userWallet.id, input: dto, tx });
  return processPaymentStatusUpdate({ options: handleOptions, paymentRepository, outboxRepository, paymentType });
};

const executeWalletOperation = async (options: ExecuteWalletOperationInput): Promise<void> => {
  const { walletService, walletId, amountMinor, currency, paymentId, paymentType, tx } = options;

  const walletOperation =
    paymentType === PaymentType.DEPOSIT ? walletService.creditWallet.bind(walletService) : walletService.debitWallet.bind(walletService);

  await walletOperation({ walletId, amountMinor, currency, transactionId: paymentId, reference: `${paymentType}: ${paymentId}`, adapter: tx });
};

const createHandleOptions = ({ paymentId, userId, walletId, input, tx }: CreateHandleOptionsInput): HandlePaymentOptionsDto => {
  return { id: paymentId, paymentId, userId, walletId, input, status: PaymentStatus.COMPLETED, tx };
};
