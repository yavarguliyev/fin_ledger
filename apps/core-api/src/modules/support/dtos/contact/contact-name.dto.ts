import { z } from 'zod';

export const ContactNameSchema = z.object({
  name: z.string({ message: 'Name must be a string' }).nullable(),

  avatarKey: z.string({ message: 'Avatar key must be a string' }).nullable().optional()
});

export type ContactNameDto = z.infer<typeof ContactNameSchema>;
