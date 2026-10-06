import { z } from 'zod';

import { SortedSetAddDto } from '../cache/sorted-set-add.dto';

export const IndexEntriesOptionsSchema = z.object({
  entries: z.custom<(input: never, result: never) => SortedSetAddDto[]>()
});

export type IndexEntriesOptionsDto = z.infer<typeof IndexEntriesOptionsSchema>;
