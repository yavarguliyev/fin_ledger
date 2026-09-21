import { z } from 'zod';

import { PlaceBetRequestSchema } from '../request/place-bet-request.dto';

export const PlaceBetSchema = PlaceBetRequestSchema.extend({
  userId: z.string({ message: 'User ID must be a string' })
});

export type PlaceBetDto = z.infer<typeof PlaceBetSchema>;
