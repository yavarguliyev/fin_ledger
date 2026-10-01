import type { Response } from 'express';
import { z } from 'zod';

export const CookieResponseSchema = z.object({ response: z.custom<Response>() });

export type CookieResponseDto = z.infer<typeof CookieResponseSchema>;
