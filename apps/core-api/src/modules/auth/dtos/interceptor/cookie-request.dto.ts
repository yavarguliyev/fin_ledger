import type { Request } from 'express';
import { z } from 'zod';

export const CookieRequestSchema = z.object({ request: z.custom<Request>() });

export type CookieRequestDto = z.infer<typeof CookieRequestSchema>;
