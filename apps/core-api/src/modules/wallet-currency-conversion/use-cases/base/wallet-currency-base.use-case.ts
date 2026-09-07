import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseAdapter, PostgresService, REDIS_CACHE_PROVIDER, RedisCacheProvider, WalletStatus } from '@common/libs';

import { FxQuoteDto } from '../../../fx-rate/dtos/quote/fx-quote.dto';
import { ConvertParamsDto } from '../../dtos/wallet/convert-params.dto';
import { FrankfurterFxQuoteProvider } from '../../../fx-rate/providers/frankfurter-fx-quote.provider';
import { FxRateRepository } from '../../../fx-rate/repositories/fx-rate.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { LedgerAccountRepository } from '../../../ledger/repositories/ledger-account.repository';
import { SourceWalletConversionDto } from '../../../wallet/dtos/conversion/source-wallet-conversion.dto';
import { WalletCurrencyInput, WalletDto } from '../../../wallet/dtos/wallet/wallet.dto';
import { toSafeMinor } from '../../helpers/conversion/to-safe-minor.helper';
import { normalizeCurrency } from '../../helpers/conversion/normalize-currency.helper';
import { WalletRepository } from '../../../wallet/repositories/wallet.repository';
import { WalletCurrencyConversionRepository } from '../../repositories/wallet-currency-conversion.repository';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

export interface WalletCurrencyInputWithIds extends WalletCurrencyInput {
  walletId?: string | undefined;
  ledgerAccountId?: string | undefined;
}

@Injectable()
export abstract class WalletCurrencyBaseUseCase<TInput, TOutput> {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    protected readonly postgresService: PostgresService,
    protected readonly walletRepository: WalletRepository,
    protected readonly walletTransactionRepository: WalletTransactionRepository,
    protected readonly ledgerAccountRepository: LedgerAccountRepository,
    protected readonly ledgerService: LedgerService,
    protected readonly fxRateRepository: FxRateRepository,
    protected readonly walletCurrencyConversionRepository: WalletCurrencyConversionRepository,
    protected readonly frankfurterFxQuoteProvider: FrankfurterFxQuoteProvider
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  protected abstract applyConversion(params: ConvertParamsDto): Promise<WalletDto>;
  protected abstract execute(input: TInput): Promise<TOutput>;

  protected async processWalletCurrency ({ userId, currency, walletId, ledgerAccountId }: WalletCurrencyInputWithIds): Promise<WalletDto> {
    if (!walletId) throw new NotFoundException('User wallet not found');

    const targetCurrency = normalizeCurrency(currency);
    const { wallet, quote } = await this.getWalletQuote(walletId, targetCurrency);

    if (!quote) return wallet;

    return this.postgresService
      .getWriteConnection()
      .transaction(tx => this.applyConversion({ userId, targetCurrency, quote, tx, walletId, ledgerAccountId }));
  }

  protected async getWalletQuote (walletId: string, targetCurrency: string): Promise<{ wallet: WalletDto; quote: FxQuoteDto | null }> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.currency === targetCurrency) return { wallet, quote: null };

    const quote = await this.frankfurterFxQuoteProvider.quote(wallet.currency, targetCurrency);
    return { wallet, quote };
  }

  protected async getSource (
    walletId: string,
    ledgerAccountId: string | undefined,
    targetCurrency: string,
    quote: FxQuoteDto,
    tx: DatabaseAdapter
  ): Promise<SourceWalletConversionDto> {
    if (!ledgerAccountId) throw new NotFoundException('User ledger account not found');

    const wallet = await this.walletRepository.findByIdForUpdate(walletId, tx);
    if (!wallet) throw new NotFoundException('Wallet not found');

    const ledgerAccount = await this.ledgerAccountRepository.findByIdForUpdate(ledgerAccountId, tx);

    if (!ledgerAccount) throw new NotFoundException('Ledger account not found');
    if (wallet.currency === targetCurrency) return { wallet, ledgerAccount, amountMinor: 0 };
    if (wallet.status !== WalletStatus.ACTIVE) throw new ConflictException('Wallet is not active');

    if (wallet.currency !== quote.baseCurrency || quote.quoteCurrency !== targetCurrency) {
      throw new ConflictException('Wallet currency changed before the FX quote could be applied');
    }

    if (quote.expiresAt.getTime() <= Date.now()) throw new ConflictException('FX quote has expired');

    const amountMinor = toSafeMinor(wallet.availableBalanceMinor, 'Wallet balance');

    if (toSafeMinor(wallet.reservedBalanceMinor, 'Reserved wallet balance') > 0) {
      throw new ConflictException('Wallet currency cannot be changed while funds are reserved');
    }

    if (ledgerAccount.currency !== wallet.currency || toSafeMinor(ledgerAccount.balanceMinor, 'Ledger balance') !== amountMinor) {
      throw new ConflictException('Wallet and ledger balances must match before currency conversion');
    }

    return { wallet, ledgerAccount, amountMinor };
  }
}
