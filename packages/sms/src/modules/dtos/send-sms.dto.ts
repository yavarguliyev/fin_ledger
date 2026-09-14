import { z } from 'zod';

export const SendSmsDtoSchema = z.object({
  phoneNumber: z.string({ message: 'Phone number must be a string' }),
  message: z.string({ message: 'Message must be a string' }),
  purpose: z.string({ message: 'Purpose must be a string' })
});

export type SendSmsDto = z.infer<typeof SendSmsDtoSchema>;
