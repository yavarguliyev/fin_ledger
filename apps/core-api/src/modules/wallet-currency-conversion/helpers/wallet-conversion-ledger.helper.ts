import { InternalServerErrorException } from '@nestjs/common';
import { WalletTransactionType } from '@common/libs';

import { LedgerEntryDto } from '../../ledger/dtos/entry/ledger-entry.dto';
import {
  ConversionDetailsDto,
  CreateLedgerEntryParamsDto,
  GetConversionDetailsParamsDto,
  LedgerEntryParamsDto
} from '../dtos/wallet-conversion-helper.dto';

export class WalletConversionLedgerHelper {
  public static getConversionDetails ({ dto, direction }: GetConversionDetailsParamsDto): ConversionDetailsDto {
    const isSource = direction === 'source';
    return {
      amountMinor: isSource ? dto.sourceAmountMinor : dto.targetAmountMinor,
      currency: isSource ? dto.sourceWallet.currency : dto.targetWallet.currency,
      ledgerAccountId: isSource ? dto.sourceLedgerAccountId : dto.targetLedgerAccountId,
      descriptionPrefix: isSource ? 'out' : 'in'
    };
  }

  public static buildConversionEntries (options: LedgerEntryParamsDto): LedgerEntryDto[] {
    const { ledgerAccountId, systemAccountId, amountMinor, currency, descriptionPrefix, reference, direction } = options;

    const baseEntry = { amountMinor, currency, reference };
    const conversionDescription = 'Wallet currency conversion';

    const [ledgerEntryType, systemEntryType] =
      direction === 'source'
        ? [WalletTransactionType.DEBIT, WalletTransactionType.CREDIT]
        : [WalletTransactionType.CREDIT, WalletTransactionType.DEBIT];

    const ledgerEntry = {
      accountId: ledgerAccountId,
      entryType: ledgerEntryType,
      description: `${conversionDescription} ${descriptionPrefix}`,
      ...baseEntry
    };

    const systemEntry = {
      accountId: systemAccountId,
      entryType: systemEntryType,
      description: `${conversionDescription} settlement`,
      ...baseEntry
    };

    return [ledgerEntry, systemEntry];
  }

  public static async createConversionEntry ({ dto, systemAccountId, ledgerService, direction }: CreateLedgerEntryParamsDto): Promise<string> {
    const { amountMinor, currency, ledgerAccountId, descriptionPrefix } = WalletConversionLedgerHelper.getConversionDetails({ dto, direction });

    const entries = WalletConversionLedgerHelper.buildConversionEntries({
      ledgerAccountId,
      systemAccountId,
      amountMinor,
      currency,
      descriptionPrefix,
      reference: dto.conversion.id,
      direction
    });

    const createdEntries = await ledgerService.createTransaction(entries, dto.tx);
    const firstEntry = createdEntries[0];

    if (!firstEntry) {
      throw new InternalServerErrorException('Failed to create ledger entries');
    }

    return firstEntry.id;
  }
}
