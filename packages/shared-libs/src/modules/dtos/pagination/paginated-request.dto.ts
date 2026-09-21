import { z } from 'zod';

import { PaginationShape } from '../../types/base.type';

export const PaginatedRequestSchema = <T extends z.ZodRawShape>({ shape }: { shape: T }): z.ZodObject<T & PaginationShape> =>
  z.object({
    ...shape,
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(25)
  });

export type PaginatedRequestDto<T extends z.ZodRawShape> = z.infer<ReturnType<typeof PaginatedRequestSchema<T>>>;
