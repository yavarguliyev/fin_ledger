import { z } from 'zod';
import { SessionData } from '@common/libs';

export const IssueStreamTicketSchema = z.object({ session: z.custom<SessionData>() });

export type IssueStreamTicketDto = z.infer<typeof IssueStreamTicketSchema>;
