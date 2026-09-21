import { z } from 'zod';
import { UserRoles } from '@common/libs';

import { GetWalletSummaryRequestSchema } from '../request/get-wallet-summary-request.dto';

export const GetWalletSummarySchema = GetWalletSummaryRequestSchema.extend({
  role: z.enum(UserRoles, { message: 'Role must be a valid user role' }).optional()
});

export type GetWalletSummaryDto = z.infer<typeof GetWalletSummarySchema>;
