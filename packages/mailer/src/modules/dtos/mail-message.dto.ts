import { z } from 'zod';

export const MailMessageSchema = z.object({
  from: z.string({ message: 'From must be a string' }),

  to: z.string({ message: 'To must be a string' }),

  subject: z.string({ message: 'Subject must be a string' }),

  text: z.string({ message: 'Text must be a string' }),

  html: z.string({ message: 'HTML must be a string' })
});

export type MailMessageDto = z.infer<typeof MailMessageSchema>;
