import type { Response } from 'express';
import { z } from 'zod';

export const MoveRefreshCookieSchema = z.object({
  response: z.custom<Response>(),

  body: z.unknown()
});

export type MoveRefreshCookieDto = z.infer<typeof MoveRefreshCookieSchema>;
