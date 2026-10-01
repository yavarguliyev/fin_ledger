import { z } from 'zod';

export const DateOfBirthSchema = z.object({ dateOfBirth: z.string({ message: 'Date of birth must be a string' }) });

export type DateOfBirthDto = z.infer<typeof DateOfBirthSchema>;
