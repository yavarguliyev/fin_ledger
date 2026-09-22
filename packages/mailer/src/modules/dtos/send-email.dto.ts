import { z } from 'zod';

export const SendEmailSchema = z.object({
  to: z.email({ message: 'Recipient must be a valid email' }),

  subject: z.string({ message: 'Subject must be a string' }),

  purpose: z.string({ message: 'Purpose must be a string' }),

  title: z.string({ message: 'Title must be a string' }),

  body: z.string({ message: 'Body must be a string' }),

  url: z.string({ message: 'URL must be a string' })
});

export type SendEmailDto = z.infer<typeof SendEmailSchema>;
