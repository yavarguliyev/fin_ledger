import { z } from 'zod';

import { SUPPORT_PINS } from '../../constants/support-pins.constant';

export const PinMessageRequestSchema = z.object({
  duration: z.enum(SUPPORT_PINS.DURATIONS, { message: 'Duration must be DAY, WEEK or MONTH' })
});

export type PinMessageRequestDto = z.infer<typeof PinMessageRequestSchema>;
