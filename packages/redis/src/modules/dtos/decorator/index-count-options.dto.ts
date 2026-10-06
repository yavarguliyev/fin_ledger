import { z } from 'zod';

import { SortedSetCountDto } from '../cache/sorted-set-count.dto';

export const IndexCountOptionsSchema = z.object({
  index: z.custom<(input: never) => SortedSetCountDto>()
});

export type IndexCountOptionsDto = z.infer<typeof IndexCountOptionsSchema>;
