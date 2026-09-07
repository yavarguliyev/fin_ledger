import { z } from 'zod';

import { AmountMinorSchema } from '../balance/amount-minor.dto';

export type ReserveReleaseDto = z.infer<typeof AmountMinorSchema>;
