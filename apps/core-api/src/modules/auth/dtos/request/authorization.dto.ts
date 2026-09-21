import { z } from 'zod';

export const AuthorizationSchema = z.object({
  authorization: z.string({ message: 'Authorization header must be a string' }).optional()
});

export type AuthorizationDto = z.infer<typeof AuthorizationSchema>;
