import { z } from 'zod';

export const StaffRefSchema = z.object({ staffUserId: z.string({ message: 'Staff user ID must be a string' }) });

export type StaffRefDto = z.infer<typeof StaffRefSchema>;
