import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import {
  BuildAnalyticsEventPayloadInput,
  BuildWalletTransactionInput,
  PlaceBet,
  ValidateWalletTransactionInput,
  WalletTransactionOutput
} from '../../dtos/betting/place-bet.dto';
import { WalletTransactionResultDto } from '../../dtos/transaction/wallet-transaction-result.dto';
import { performWalletBalanceUpdate } from '../wallet/perform-wallet-balance-update.helper';
import { AnalyticsEventPayload } from '../../../analytics/dtos/analytics-event.dto';
import { createEvent } from '../events/create-event.helper';
import { recordWalletTransactions } from '../../../wallet-currency-conversion/helpers/transactions/record-wallet-transactions.helper';

const buildWalletTransactionInput = (options: BuildWalletTransactionInput): WalletTransactionOutput => {
  const { wallet, amountMinor, transactionId, adapter, reference } = options;
  return { wallet, amountMinor, transactionId, ...(adapter && { adapter }), ...(reference && { reference }) };
};

const buildAnalyticsEventPayload = (options: BuildAnalyticsEventPayloadInput): AnalyticsEventPayload => {
  const { walletId, amountMinor, currency, transactionId, reference, currentBettingType } = options;
  const bettingType = currentBettingType !== 'NONE' ? { type: currentBettingType } : {};
  return { walletId, amountMinor, currency, transactionId, reference, timestamp: new Date().toISOString(), ...bettingType };
};

const validateWalletTransaction = (options: ValidateWalletTransactionInput): NonNullable<typeof wallet> => {
  const { wallet, currency, amountMinor, requiredToCheckAmountMinor } = options;

  if (!wallet) throw new NotFoundException('Wallet not found');
  if (wallet.currency !== currency) throw new ConflictException('Currency mismatch');
  if (requiredToCheckAmountMinor && Number(wallet.availableBalanceMinor) < amountMinor) throw new BadRequestException('Insufficient funds');

  return wallet;
};

export const processWalletTransaction = async (options: PlaceBet): Promise<WalletTransactionResultDto> => {
  const {
    amountMinor,
    currency,
    transactionId,
    reference,
    adapter,
    walletRepository,
    requiredToCheckAmountMinor,
    balanceWalletTransactionType,
    currentBettingType,
    currentAggregateType: aggregateType,
    currentDomainEventType: eventType,
    currentWalletTransactionType: transactionType,
    outboxRepository,
    ledgerService,
    walletTransactionRepository,
    walletId
  } = options;

  const walletToValidate = await walletRepository.findByIdForUpdate(options.walletId, adapter);
  const wallet = validateWalletTransaction({ wallet: walletToValidate, currency, amountMinor, requiredToCheckAmountMinor });

  const updatedWallet = await performWalletBalanceUpdate({ wallet, amountMinor, tx: adapter!, balanceWalletTransactionType, walletRepository });
  const input = buildWalletTransactionInput({ wallet, amountMinor, transactionId, adapter, reference });
  await recordWalletTransactions({ input, ledgerService, walletTransactionRepository, transactionType, direction: balanceWalletTransactionType });

  const eventPayload = buildAnalyticsEventPayload({ walletId, amountMinor, currency, transactionId, reference, currentBettingType });
  await createEvent({ eventPayload: { ...eventPayload, userId: wallet.userId }, eventType, aggregateType, outboxRepository, tx: adapter! });

  return { wallet: updatedWallet, eventPayload };
};
