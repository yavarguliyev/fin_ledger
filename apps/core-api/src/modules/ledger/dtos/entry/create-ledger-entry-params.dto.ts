import { z } from 'zod';
import { FLOW_DIRECTIONS } from '@common/libs';

import { CurrencyLedgerDto, CurrencyLedgerSchema } from '../currency/currency-ledger.dto';
import { LedgerService } from '../../ledger.service';

export const CreateLedgerEntryParamsSchema = z.object({
  systemAccountId: z.string({ message: 'System account ID must be a string' }),

  direction: z.enum(FLOW_DIRECTIONS, { message: 'Direction must be a valid flow direction' }),

  dto: CurrencyLedgerSchema
});

export type CreateLedgerEntryParamsDto = z.infer<typeof CreateLedgerEntryParamsSchema> & { dto: CurrencyLedgerDto; ledgerService: LedgerService };
