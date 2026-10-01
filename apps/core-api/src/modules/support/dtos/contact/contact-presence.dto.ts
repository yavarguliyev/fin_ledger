import { z } from 'zod';

import { SupportContactSchema } from './support-contact.dto';

export const ContactPresenceSchema = z.object({
  contact: SupportContactSchema,

  online: z.boolean({ message: 'Online must be a boolean' }),

  lastSeenAt: z.string({ message: 'Last seen at must be a string' }).nullable()
});

export type ContactPresenceDto = z.infer<typeof ContactPresenceSchema>;
