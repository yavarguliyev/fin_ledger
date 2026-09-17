import { IPaymentProvider, OutboxRepository, PaymentProvider, PaymentType } from '@common/libs';

import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentMethodRepository } from '../../payment-methods/repositories/payment-method.repository';
import { WalletService } from '../../wallet/wallet.service';
import { WalletSummaryDto } from '../../wallet/dtos/wallet/wallet-summary.dto';
import { RequestPaymentDto } from './request/request-payment.dto';
import { PaymentDto } from './payment/payment.dto';
import { PaymentMethodDto } from '../../payment-methods/dtos/payment-method/payment-method.dto';
import { PaymentAnalyticsEventPayloadDto } from './analytics/payment-analytics-event.dto';

export type ValidateAndGetPaymentMethodDto = {
  userId: string;
  paymentMethodId?: string | undefined;
  paymentMethodRepository: PaymentMethodRepository;
};

export type ExecuteDepositOperationDto = {
  payment: PaymentDto;
  dto: RequestPaymentDto;
  userWallet: WalletSummaryDto;
  method: PaymentMethodDto;
  provider: IPaymentProvider;
  walletService: WalletService;
  paymentRepository: PaymentRepository;
};

export type ExecuteWithdrawalOperationDto = {
  payment: PaymentDto;
  dto: RequestPaymentDto;
  userWallet: WalletSummaryDto;
  method: PaymentMethodDto;
  provider: IPaymentProvider;
  walletService: WalletService;
  paymentRepository: PaymentRepository;
};

export type PublishPaymentEventsDto = {
  payment: PaymentDto;
  walletId: string;
  userId: string;
  dto: RequestPaymentDto;
  updated: PaymentDto;
  paymentType: PaymentType;
  outboxRepository: OutboxRepository;
  publishPaymentCompleted: (payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>;
  publishPaymentFailed: (payload: PaymentAnalyticsEventPayloadDto) => Promise<PaymentAnalyticsEventPayloadDto>;
};

export type CreatePaymentRecordDto = { userId: string; wallet: WalletSummaryDto; dto: RequestPaymentDto; provider: PaymentProvider };

export type DispatchPaymentOperationDto = { payment: PaymentDto; dto: RequestPaymentDto; userWallet: WalletSummaryDto; method: PaymentMethodDto };

export type RevertWithdrawalDto = {
  walletService: ExecuteWithdrawalOperationDto['walletService'];
  paymentRepository: ExecuteWithdrawalOperationDto['paymentRepository'];
  walletId: string;
  amountMinor: number;
  currency: string;
  paymentId: string;
  transactionId: string;
};

export type { PaymentAnalyticsEventPayloadDto };
