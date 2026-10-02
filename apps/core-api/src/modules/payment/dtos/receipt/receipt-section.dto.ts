import { z } from 'zod';

export const ReceiptSectionSchema = z.object({
  document: z.custom<PDFKit.PDFDocument>(),

  title: z.string({ message: 'Title must be a string' }),

  top: z.number({ message: 'Top must be a number' })
});

export type ReceiptSectionDto = z.infer<typeof ReceiptSectionSchema>;
