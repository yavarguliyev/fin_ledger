import { z } from 'zod';

export const IssueRefreshSchema = z.object({ userId: z.string({ message: 'User ID must be a string' }) });

export type IssueRefreshDto = z.infer<typeof IssueRefreshSchema>;
