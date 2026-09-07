import { z } from 'zod';

export const UserSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  indexes: z
    .array(z.number({ message: 'Each index must be an integer' }).int({ message: 'Each index must be an integer' }), {
      message: 'Indexes must be an array'
    })
    .optional()
});

export type UserImagesDto = z.infer<typeof UserSchema>;
