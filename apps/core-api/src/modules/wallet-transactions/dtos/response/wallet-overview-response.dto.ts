import { z } from 'zod';
import { PaginatedResponseDto } from '@common/libs';

import { WalletTransactionRecordDto, WalletTransactionSummarySchema } from '../../../wallet';

export const WalletOverviewResponseSchema = z.object({
  summary: z.array(WalletTransactionSummarySchema),

  recent: z.custom<PaginatedResponseDto<WalletTransactionRecordDto>>()
});

export type WalletOverviewResponseDto = z.infer<typeof WalletOverviewResponseSchema>;
