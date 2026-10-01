import { z } from 'zod';
import { UnknownRecord } from '@common/libs';

export const UserRowSchema = z.object({ row: z.custom<UnknownRecord>() });

export type UserRowDto = z.infer<typeof UserRowSchema>;
