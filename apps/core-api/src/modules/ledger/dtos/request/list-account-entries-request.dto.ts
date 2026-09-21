import { z } from 'zod';
import { PaginatedRequestSchema } from '@common/libs';

export const ListAccountEntriesRequestSchema = PaginatedRequestSchema({
  shape: {
    id: z.string({ message: 'Account ID must be a string' }).min(1, { message: 'Account ID is required' })
  }
});

export type ListAccountEntriesRequestDto = z.infer<typeof ListAccountEntriesRequestSchema>;
