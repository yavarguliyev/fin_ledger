import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { WalletTransactionStatus } from '@common/libs';

import { WalletConversionContextDto } from '../../wallet/dtos/conversion/wallet-conversion-context.dto';
import { WalletDto } from '../../wallet/dtos/wallet/wallet.dto';
import {
  CurrencyConversionRequest,
  CurrencyConversionResponseDto,
  RecorConversion,
  WalletConversionParams
} from '../dtos/wallet-conversion-helper.dto';
import { WalletConversionTransactionHelper } from './wallet-conversion-transaction.helper';

export class WalletConversionHelper {
  public static normalizeCurrency (currency: string): string {
    const normalized = currency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) throw new BadRequestException('Currency must be a 3-letter ISO code');
    return normalized;
  }

  public static toSafeMinor (value: number | undefined, label: string): number {
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount < 0) throw new ConflictException(`${label} is invalid`);
    return amount;
  }

  public static convertMinorAmount (sourceAmountMinor: number | string, rate: string): number {
    const numericAmount = Number(sourceAmountMinor);
    if (!Number.isSafeInteger(numericAmount)) throw new BadRequestException('Source amount must be a safe integer');

    const isNegative = numericAmount < 0;
    const absAmount = Math.abs(numericAmount);

    const match = rate.match(/^(\d+)(?:\.(\d+))?$/);
    const whole = match?.[1];
    const fractional = match?.[2] ?? '';
    if (!whole) throw new BadRequestException('FX rate is invalid');

    const scale = 10n ** BigInt(fractional.length);
    const scaledRate = BigInt(`${whole}${fractional}`);
    if (scaledRate <= 0n) throw new BadRequestException('FX rate must be greater than zero');

    const result = (BigInt(absAmount) * scaledRate + scale / 2n) / scale;
    if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new BadRequestException('Converted amount exceeds the supported range');

    const finalAmount = Number(result);
    return isNegative ? -finalAmount : finalAmount;
  }

  public static async createConversionRecord (options: CurrencyConversionRequest): Promise<CurrencyConversionResponseDto> {
    const { walletCurrencyConversionRepository, source, context, fxRateId, quote, tx, userId } = options;

    const conversion = await walletCurrencyConversionRepository.createConversion(
      {
        ...context,
        userId,
        sourceWalletId: source.wallet.id,
        targetWalletId: source.wallet.id,
        sourceCurrency: source.wallet.currency,
        feeAmountMinor: 0,
        feeCurrency: context.targetCurrency,
        fxRateId,
        rate: quote.rate,
        rateProvider: quote.provider,
        idempotencyKey: fxRateId,
        status: WalletTransactionStatus.COMPLETED
      },
      tx
    );

    if (!conversion) throw new InternalServerErrorException('Failed to record wallet currency conversion');
    return conversion;
  }

  public static async recordConversion (options: RecorConversion): Promise<CurrencyConversionResponseDto> {
    const {
      source,
      targetAmountMinor,
      targetCurrency,
      fxRateId,
      quote,
      tx,
      userId,
      ledgerService,
      walletTransactionRepository,
      walletCurrencyConversionRepository
    } = options;

    const context: WalletConversionContextDto = {
      sourceLedgerAccountId: source.ledgerAccount.id,
      targetLedgerAccountId: source.ledgerAccount.id,
      targetCurrency,
      sourceAmountMinor: source.amountMinor,
      targetAmountMinor
    };

    const conversion = await WalletConversionHelper.createConversionRecord({
      walletCurrencyConversionRepository,
      source,
      context,
      fxRateId,
      quote,
      tx,
      userId
    });
    const dto = { ...context, sourceWallet: source.wallet, targetWallet: source.wallet, conversion, tx };

    await WalletConversionTransactionHelper.recordWalletCurrencyConversion({ dto, ledgerService, walletTransactionRepository });
    return conversion;
  }

  public static async updateWalletAndLedger (options: WalletConversionParams): Promise<WalletDto> {
    const { source, targetCurrency, targetAmountMinor, tx, walletRepository, ledgerAccountRepository } = options;

    const [updatedWallet, updatedLedgerAccount] = await Promise.all([
      walletRepository.update(source.wallet.id, { currency: targetCurrency, availableBalanceMinor: targetAmountMinor }, undefined, tx),
      ledgerAccountRepository.update(source.ledgerAccount.id, { currency: targetCurrency, balanceMinor: targetAmountMinor }, undefined, tx)
    ]);

    if (!updatedWallet) throw new InternalServerErrorException('Failed to update wallet currency');
    if (!updatedLedgerAccount) throw new InternalServerErrorException('Failed to update ledger account currency');

    return updatedWallet;
  }
}
