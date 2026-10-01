import { z } from 'zod';

import { SupportStreamEventSchema } from './support-stream-event.dto';

export const SupportStreamEventRefSchema = z.object({ event: SupportStreamEventSchema });

export type SupportStreamEventRefDto = z.infer<typeof SupportStreamEventRefSchema>;
