import { z } from 'zod';
import { SessionData } from '@common/libs';

export const IssueStreamTicketRequestSchema = z.object({ session: z.custom<SessionData>() });

export type IssueStreamTicketRequestDto = z.infer<typeof IssueStreamTicketRequestSchema>;
