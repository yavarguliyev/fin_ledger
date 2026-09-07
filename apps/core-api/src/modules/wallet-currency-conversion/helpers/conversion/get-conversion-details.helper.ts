import { GetConversionDetailsParamsDto } from '../../../ledger/dtos/currency/get-conversion-details.dto';
import { ConversionDetailsDto } from '../../dtos/conversion/conversion-details.dto';

export const getConversionDetails = ({ dto, direction }: GetConversionDetailsParamsDto): ConversionDetailsDto => {
  const isSource = direction === 'source';
  return {
    amountMinor: isSource ? dto.sourceAmountMinor : dto.targetAmountMinor,
    currency: isSource ? dto.sourceWallet.currency : dto.targetWallet.currency,
    ledgerAccountId: isSource ? dto.sourceLedgerAccountId : dto.targetLedgerAccountId,
    descriptionPrefix: isSource ? 'out' : 'in'
  };
};
