import { z } from 'zod';

import { SessionData } from '../../interfaces/session-data.interface';

export const IssueStreamTicketSchema = z.object({ session: z.custom<SessionData>() });

export type IssueStreamTicketDto = z.infer<typeof IssueStreamTicketSchema>;
