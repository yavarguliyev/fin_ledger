import { z } from 'zod';

export const MfaDisabledResponseSchema = z.object({
  success: z.boolean({ message: 'Success must be a boolean' }),

  message: z.string({ message: 'Message must be a string' })
});

export type MfaDisabledResponseDto = z.infer<typeof MfaDisabledResponseSchema>;
