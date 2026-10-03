import { z } from 'zod';

import { LEDGER_ENTRY_LIST } from '../../constants/list/ledger-entry-list.constant';

export const ListAccountEntriesRequestSchema = z
  .object({
    id: z.string({ message: 'Account ID must be a string' }).min(1, { message: 'Account ID is required' }),

    limit: z.coerce.number({ message: 'Limit must be a number' }).int().positive().max(LEDGER_ENTRY_LIST.MAX_LIMIT).default(LEDGER_ENTRY_LIST.DEFAULT_LIMIT),

    before: z.iso.datetime({ offset: true, message: 'Before must be an ISO date-time' }).optional(),

    beforeId: z.uuid({ message: 'Before ID must be a UUID' }).optional()
  })
  .refine(({ before, beforeId }) => !before === !beforeId, { message: LEDGER_ENTRY_LIST.CURSOR_MESSAGE });

export type ListAccountEntriesRequestDto = z.infer<typeof ListAccountEntriesRequestSchema>;
