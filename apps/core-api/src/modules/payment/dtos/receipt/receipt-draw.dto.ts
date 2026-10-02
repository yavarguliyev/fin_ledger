import { z } from 'zod';

import { ReceiptSchema } from './receipt.dto';

export const ReceiptDrawSchema = z.object({
  document: z.custom<PDFKit.PDFDocument>(),

  receipt: ReceiptSchema
});

export type ReceiptDrawDto = z.infer<typeof ReceiptDrawSchema>;
