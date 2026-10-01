import { z } from 'zod';

export const MfaEnrollmentResponseSchema = z.object({
  otpauthUri: z.string({ message: 'OTP auth URI must be a string' }),

  qrCodeDataUrl: z.string({ message: 'QR code data URL must be a string' })
});

export type MfaEnrollmentResponseDto = z.infer<typeof MfaEnrollmentResponseSchema>;
