import { z } from 'zod';

import { ReceiptSchema } from './receipt.dto';

export const ReceiptRefSchema = z.object({ receipt: ReceiptSchema });

export type ReceiptRefDto = z.infer<typeof ReceiptRefSchema>;
