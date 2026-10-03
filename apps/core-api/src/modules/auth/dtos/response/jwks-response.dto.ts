import { z } from 'zod';

export const JwksResponseSchema = z.object({
  keys: z.array(
    z.object({
      kty: z.string({ message: 'Key type must be a string' }),

      use: z.string({ message: 'Key use must be a string' }),

      alg: z.string({ message: 'Algorithm must be a string' }),

      kid: z.string({ message: 'Key id must be a string' }),

      n: z.string({ message: 'Modulus must be a string' }),

      e: z.string({ message: 'Exponent must be a string' })
    })
  )
});

export type JwksResponseDto = z.infer<typeof JwksResponseSchema>;
