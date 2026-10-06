import { z } from 'zod';

export const ContactNameSchema = z.object({
  name: z.string({ message: 'Name must be a string' }).nullable()
});

export type ContactNameDto = z.infer<typeof ContactNameSchema>;
