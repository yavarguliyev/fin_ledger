import { z } from 'zod';

export const ContactCardResponseSchema = z.object({
  isStaff: z.boolean({ message: 'Is staff must be a boolean' }),

  name: z.string({ message: 'Name must be a string' }).nullable(),

  team: z.string({ message: 'Team must be a string' }).optional(),

  userId: z.string({ message: 'User ID must be a string' }).optional(),

  role: z.string({ message: 'Role must be a string' }).optional(),

  memberSince: z.date({ message: 'Member since must be a date' }).optional(),

  accountStatus: z.string({ message: 'Account status must be a string' }).optional(),

  kycStatus: z.string({ message: 'KYC status must be a string' }).optional(),

  avatarUrl: z.string({ message: 'Avatar URL must be a string' }).nullable().optional()
});

export type ContactCardResponseDto = z.infer<typeof ContactCardResponseSchema>;
