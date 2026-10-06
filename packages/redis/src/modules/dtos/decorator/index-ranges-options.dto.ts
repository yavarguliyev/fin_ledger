import { z } from 'zod';

import { SortedSetRangeDto } from '../cache/sorted-set-range.dto';

export const IndexRangesOptionsSchema = z.object({
  ranges: z.custom<(input: never) => SortedSetRangeDto[]>()
});

export type IndexRangesOptionsDto = z.infer<typeof IndexRangesOptionsSchema>;
