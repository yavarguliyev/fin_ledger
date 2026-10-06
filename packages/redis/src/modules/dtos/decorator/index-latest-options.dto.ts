import { z } from 'zod';

import { SortedSetLatestDto } from '../cache/sorted-set-latest.dto';

export const IndexLatestOptionsSchema = z.object({
  index: z.custom<(input: never) => SortedSetLatestDto>()
});

export type IndexLatestOptionsDto = z.infer<typeof IndexLatestOptionsSchema>;
