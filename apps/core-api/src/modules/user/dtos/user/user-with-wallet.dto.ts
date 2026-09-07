import { z } from 'zod';
import { WALLET_STATUS } from '@common/libs';

export const UserWithWalletSchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string(),
  role: z.string(),
  wallet_id: z.string().nullable(),
  is_email_verified: z.boolean(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  available_balance_minor: z.number().nullable(),
  reserved_balance_minor: z.number().nullable(),
  currency: z.string().nullable(),
  status: z.enum(WALLET_STATUS).nullable()
});

export type UserWithWalletDto = z.infer<typeof UserWithWalletSchema>;
