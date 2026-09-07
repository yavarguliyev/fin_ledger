import { z } from 'zod';

export type PadinatedDto = { page: z.ZodDefault<z.ZodCoercedNumber>; limit: z.ZodDefault<z.ZodCoercedNumber> };

export const PaginatedRequestSchema = <T extends z.ZodRawShape>(shape: T): z.ZodObject<T & PadinatedDto> =>
  z.object({
    ...shape,
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(25)
  });

export type PaginatedRequestDto<T extends z.ZodRawShape> = z.infer<ReturnType<typeof PaginatedRequestSchema<T>>>;
