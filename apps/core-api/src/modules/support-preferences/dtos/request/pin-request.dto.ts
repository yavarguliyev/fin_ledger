import { z } from 'zod';

export const PinRequestSchema = z.object({
  pinned: z.boolean({ message: 'Pinned must be true or false' })
});

export type PinRequestDto = z.infer<typeof PinRequestSchema>;
