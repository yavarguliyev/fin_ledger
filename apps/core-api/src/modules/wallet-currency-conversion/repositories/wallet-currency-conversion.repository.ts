import { Injectable } from '@nestjs/common';
import { BaseRepository, DatabaseAdapter, PostgresService } from '@common/libs';

import { CreateWalletCurrencyConversionDto } from '../dtos/conversion/create-wallet-currency-conversion.dto';
import { CurrencyConversionResponseDto } from '../dtos/conversion/currency-conversion.response.dto';

@Injectable()
export class WalletCurrencyConversionRepository extends BaseRepository<CurrencyConversionResponseDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'wallet_currency_conversions', {
      userId: 'user_id',
      sourceWalletId: 'source_wallet_id',
      targetWalletId: 'target_wallet_id',
      sourceLedgerAccountId: 'source_ledger_account_id',
      targetLedgerAccountId: 'target_ledger_account_id',
      sourceCurrency: 'source_currency',
      targetCurrency: 'target_currency',
      sourceAmountMinor: 'source_amount_minor',
      targetAmountMinor: 'target_amount_minor',
      feeAmountMinor: 'fee_amount_minor',
      feeCurrency: 'fee_currency',
      fxRateId: 'fx_rate_id',
      rateProvider: 'rate_provider',
      idempotencyKey: 'idempotency_key',
      createdAt: 'created_at'
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'userId',
      'sourceWalletId',
      'targetWalletId',
      'sourceLedgerAccountId',
      'targetLedgerAccountId',
      'sourceCurrency',
      'targetCurrency',
      'sourceAmountMinor',
      'targetAmountMinor',
      'feeAmountMinor',
      'feeCurrency',
      'fxRateId',
      'rate',
      'rateProvider',
      'idempotencyKey',
      'status',
      'createdAt'
    ];
  }

  async createConversion (dto: CreateWalletCurrencyConversionDto, adapter: DatabaseAdapter): Promise<CurrencyConversionResponseDto | null> {
    return this.create(dto, undefined, adapter);
  }
}
