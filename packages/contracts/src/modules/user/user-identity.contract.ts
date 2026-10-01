import { z } from 'zod';

export const UserIdentityContractSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  email: z.string({ message: 'Email must be a string' }),

  displayName: z.string({ message: 'Display name must be a string' }),

  role: z.string({ message: 'Role must be a string' }),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).nullable(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }),

  profileImageIndex: z.number({ message: 'Profile image index must be a number' }).int({ message: 'Profile image index must be an integer' }),

  countryCode: z.string({ message: 'Country code must be a string' }).nullable(),

  dateOfBirth: z.string({ message: 'Date of birth must be a string' }).nullable(),

  kycStatus: z.string({ message: 'KYC status must be a string' }).nullable(),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' })
});

export type UserIdentityContract = z.infer<typeof UserIdentityContractSchema>;
