import { InternalServerErrorException } from '@nestjs/common';

import { CreateLedgerEntryParamsDto } from '../../../ledger/dtos/entry/create-ledger-entry-params.dto';
import { buildConversionEntries } from './build-conversion-entries.helper';
import { getConversionDetails } from '../conversion/get-conversion-details.helper';

export const createConversionEntry = async ({ dto, systemAccountId, ledgerService, direction }: CreateLedgerEntryParamsDto): Promise<string> => {
  const { amountMinor, currency, ledgerAccountId, descriptionPrefix } = getConversionDetails({ dto, direction });

  const entries = buildConversionEntries({
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
};
