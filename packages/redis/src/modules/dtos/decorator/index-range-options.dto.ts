import { z } from 'zod';

import { SortedSetRangeDto } from '../cache/sorted-set-range.dto';

export const IndexRangeOptionsSchema = z.object({
  range: z.custom<(input: never) => SortedSetRangeDto>()
});

export type IndexRangeOptionsDto = z.infer<typeof IndexRangeOptionsSchema>;
