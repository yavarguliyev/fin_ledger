import { z } from 'zod';
import { DatabaseAdapter, FxProvider, WalletTransactionStatus } from '@common/libs';

import { FxQuoteDto } from '../../../fx-rate/dtos/quote/fx-quote.dto';
import { SourceWalletConversionDto } from '../../../wallet/dtos/conversion/source-wallet-conversion.dto';
import { WalletConversionContextDto } from '../../../wallet/dtos/conversion/wallet-conversion-context.dto';
import { WalletCurrencyConversionRepository } from '../../repositories/wallet-currency-conversion.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export const CurrencyConversionResponseSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  provider: z.enum(FxProvider, { message: 'Provider must be a valid FX provider' }),

  baseCurrency: z.string({ message: 'Base currency must be a string' }),

  quoteCurrency: z.string({ message: 'Quote currency must be a string' }),

  quotedAt: z.date({ message: 'Quoted at must be a valid date' }),

  expiresAt: z.date({ message: 'Expires at must be a valid date' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  fxRateId: z.string({ message: 'FX rate ID must be a string' }),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  status: z.enum(WalletTransactionStatus, { message: 'Status must be a valid wallet transaction status' }),

  rateProvider: z.string({ message: 'Rate provider must be a string' }),

  rate: z.string({ message: 'Rate must be a string' }),

  sourceAmountMinor: z.number({ message: 'Source amount must be a number' }).int({ message: 'Source amount must be an integer' }),

  targetAmountMinor: z.number({ message: 'Target amount must be a number' }).int({ message: 'Fee amount must be an integer' }),

  feeAmountMinor: z.number({ message: 'Fee amount must be a number' }),

  sourceCurrency: z.string({ message: 'Source currency must be a string' }),

  targetCurrency: z.string({ message: 'Target currency must be a string' }),

  feeCurrency: z.string({ message: 'Fee currency must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  sourceWalletId: z.string({ message: 'Source wallet ID must be a string' }),

  targetWalletId: z.string({ message: 'Target wallet ID must be a string' }),

  sourceLedgerAccountId: z.string({ message: 'Source ledger account ID must be a string' }),

  targetLedgerAccountId: z.string({ message: 'Target ledger account ID must be a string' })
});

export type CurrencyConversionResponseDto = z.infer<typeof CurrencyConversionResponseSchema>;

export type CurrencyConversionRequest = {
  source: SourceWalletConversionDto;
  context: WalletConversionContextDto;
  walletCurrencyConversionRepository: WalletCurrencyConversionRepository;
  fxRateId: string;
  quote: FxQuoteDto;
  tx: DatabaseAdapter;
  userId: string;
};

export type RecorConversion = {
  source: SourceWalletConversionDto;
  targetAmountMinor: number;
  targetCurrency: string;
  fxRateId: string;
  quote: FxQuoteDto;
  tx: DatabaseAdapter;
  userId: string;
  walletTransactionRepository: WalletTransactionRepository;
  walletCurrencyConversionRepository: WalletCurrencyConversionRepository;
  ledgerService: LedgerService;
};
