import { z } from 'zod';

export const SortedSetMemberSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  member: z.string({ message: 'Member must be a string' })
});

export type SortedSetMemberDto = z.infer<typeof SortedSetMemberSchema>;
