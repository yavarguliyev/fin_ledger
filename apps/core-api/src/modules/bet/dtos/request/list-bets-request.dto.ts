import { z } from 'zod';
import { BetStatus, PaginatedRequestSchema } from '@common/libs';

export const ListBetsRequestSchema = PaginatedRequestSchema({
  shape: {
    status: z.enum(BetStatus, { message: 'Status must be a valid bet status' }).optional()
  }
});

export type ListBetsRequestDto = z.infer<typeof ListBetsRequestSchema>;
