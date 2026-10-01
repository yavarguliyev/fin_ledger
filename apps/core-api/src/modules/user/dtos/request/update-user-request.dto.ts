import { z } from 'zod';

import { PROFILE_FIELDS } from '../../constants/profile/profile-fields.constant';
import { ProfileHelper } from '../../helpers/profile.helper';

export const UpdateUserRequestSchema = z.object({
  countryCode: z
    .string({ message: 'Country code must be a string' })
    .length(PROFILE_FIELDS.COUNTRY_CODE_LENGTH, { message: 'Country code must be two letters' })
    .regex(PROFILE_FIELDS.COUNTRY_CODE_PATTERN, { message: 'Country code must be two uppercase letters, e.g. GB' })
    .optional(),

  dateOfBirth: z
    .string({ message: 'Date of birth must be a string' })
    .refine(value => ProfileHelper.isRealisticAge({ dateOfBirth: value }), {
      message: `You must be at least ${PROFILE_FIELDS.MIN_AGE_YEARS} to use this service`
    })
    .optional(),

  displayName: z.string({ message: 'Display name must be a string' }).max(100, { message: 'Display name must not exceed 100 characters' }).optional(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }).optional(),

  profileImageIndex: z
    .number({ message: 'Profile image index must be an integer' })
    .int({ message: 'Profile image index must be an integer' })
    .min(0, { message: 'Profile image index must be at least 0' })
    .optional(),

  imageAction: z
    .enum(['add', 'delete_all', 'delete_by_index'], {
      message: 'Image action must be add, delete_all, or delete_by_index'
    })
    .optional(),

  deleteIndexes: z
    .array(z.number({ message: 'Each delete index must be an integer' }).int({ message: 'Each delete index must be an integer' }), {
      message: 'Delete indexes must be an array'
    })
    .optional()
});

export type UpdateUserRequestDto = z.infer<typeof UpdateUserRequestSchema>;
