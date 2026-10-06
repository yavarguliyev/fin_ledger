import { z } from 'zod';

import { SessionUserSchema } from '../../../auth';

export const UserSchema = SessionUserSchema.extend({
  passwordChangedAt: z.iso.datetime({ message: 'Password changed at must be a valid ISO datetime' }).nullable().optional()
});

export type UserDto = z.infer<typeof UserSchema>;
