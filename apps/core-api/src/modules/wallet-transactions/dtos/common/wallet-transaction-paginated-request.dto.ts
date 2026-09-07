import { z } from 'zod';
import { PaginatedRequestSchema, WalletTransactionType, UserRoles } from '@common/libs';

export const WalletPaginatedRequestSchema = PaginatedRequestSchema({ walletId: z.string() });

export type WalletPaginatedRequestDto = z.infer<typeof WalletPaginatedRequestSchema>;

export type WalletPaginatedReques = { query: WalletPaginatedRequestDto; type?: WalletTransactionType; role?: UserRoles };
