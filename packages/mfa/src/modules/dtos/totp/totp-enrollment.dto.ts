import { z } from 'zod';

export const TotpEnrollmentSchema = z.object({
  otpauthUri: z.string({ message: 'OTP auth URI must be a string' }),

  qrCodeDataUrl: z.string({ message: 'QR code data URL must be a string' })
});

export type TotpEnrollmentDto = z.infer<typeof TotpEnrollmentSchema>;
