import { z } from 'zod';

export const CallConfigResponseSchema = z.object({
  iceServers: z.array(
    z.object({
      urls: z.union([z.string(), z.array(z.string())]),

      username: z.string().optional(),

      credential: z.string().optional()
    })
  )
});

export type CallConfigResponseDto = z.infer<typeof CallConfigResponseSchema>;
