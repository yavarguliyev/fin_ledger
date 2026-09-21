import { z } from 'zod';

export const UserImagesRequestSchema = z.object({
  indexes: z
    .string({ message: 'Indexes must be a comma-separated string' })
    .optional()
    .transform(value => (value ? value.split(',').map(Number) : undefined))
    .pipe(z.array(z.number().int({ message: 'Each index must be an integer' }).nonnegative({ message: 'Each index must be 0 or greater' })).optional())
});

export type UserImagesRequestDto = z.infer<typeof UserImagesRequestSchema>;
