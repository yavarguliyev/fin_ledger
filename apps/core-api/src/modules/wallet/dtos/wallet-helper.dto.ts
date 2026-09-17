import {
  BuildAnalyticsEventPayloadInput,
  BuildWalletTransactionInput,
  PlaceBet,
  ValidateWalletTransactionInput,
  WalletTransactionOutput
} from './betting/place-bet.dto';
import { PerformWalletBalanceUpdateDto, WalletDto } from './wallet/wallet.dto';
import { WalletTransactionResultDto } from './transaction/wallet-transaction-result.dto';
import { CreateEventDto, AnalyticsEventPayload } from '../../analytics/dtos/analytics-event.dto';

export type ProcessWalletTransactionDto = PlaceBet;
export type PerformBalanceUpdateDto = PerformWalletBalanceUpdateDto;
export type CreateWalletEventDto = CreateEventDto;

export type {
  BuildAnalyticsEventPayloadInput,
  BuildWalletTransactionInput,
  ValidateWalletTransactionInput,
  WalletTransactionOutput,
  WalletTransactionResultDto,
  AnalyticsEventPayload,
  WalletDto
};
