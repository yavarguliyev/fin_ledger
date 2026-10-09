import { z } from 'zod';

import { ContactCardResponseSchema } from '../response/contact-card-response.dto';

export const CustomerCardRowSchema = ContactCardResponseSchema.extend({
  avatarKey: z.string({ message: 'Avatar key must be a string' }).nullable().optional()
});

export type CustomerCardRowDto = z.infer<typeof CustomerCardRowSchema>;
