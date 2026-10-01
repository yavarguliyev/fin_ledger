import { z } from 'zod';
import { SupportCallEndReason } from '@common/libs';

export const EndCallRequestSchema = z.object({ reason: z.enum(SupportCallEndReason, { message: 'Reason must be a valid end reason' }) });

export type EndCallRequestDto = z.infer<typeof EndCallRequestSchema>;
