import { z } from 'zod';

import { SortedSetMemberDto } from '../cache/sorted-set-member.dto';

export const IndexMembersOptionsSchema = z.object({
  members: z.custom<(input: never, result: never) => SortedSetMemberDto[]>()
});

export type IndexMembersOptionsDto = z.infer<typeof IndexMembersOptionsSchema>;
