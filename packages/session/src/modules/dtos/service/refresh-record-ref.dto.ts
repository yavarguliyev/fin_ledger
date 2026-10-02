import { z } from 'zod';

import { RefreshRecord } from '../../interfaces/refresh-record.interface';

export const RefreshRecordRefSchema = z.object({ record: z.custom<RefreshRecord>() });

export type RefreshRecordRefDto = z.infer<typeof RefreshRecordRefSchema>;
