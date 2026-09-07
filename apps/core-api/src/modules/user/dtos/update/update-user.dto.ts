import { z } from 'zod';
import { UploadFile } from '@common/libs';

export const UpdateUserSchema = z.object({
  displayName: z.string({ message: 'Display name must be a string' }).max(100, { message: 'Display name must not exceed 100 characters' }).optional(),

  currency: z
    .string({ message: 'Currency must be a string' })
    .max(3, { message: 'Currency must be 3 characters' })
    .regex(/^[A-Z]{3}$/, { message: 'Currency must be an uppercase 3-letter ISO code' })
    .refine(val => ['USD', 'EUR', 'GBP'].includes(val), { message: 'Currency must be USD, EUR, or GBP' })
    .optional(),

  profileImages: z.array(z.string({ message: 'Each profile image must be a string' }), { message: 'Profile images must be an array' }).optional(),

  profileImageIndex: z
    .number({ message: 'Profile image index must be an integer' })
    .int({ message: 'Profile image index must be an integer' })
    .min(0, { message: 'Profile image index must be at least 0' })
    .optional(),

  profileImagesKey: z.string({ message: 'Profile images key must be a string' }).optional(),

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

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export type UpdateUser = { userId: string; dto: UpdateUserDto };

export type UserUpload = { userId: string; files: UploadFile[] };
