import { z } from 'zod';
import type { PoolClient } from 'pg';

export const PoolClientSchema = z.object({ client: z.custom<PoolClient>() });

export type PoolClientDto = z.infer<typeof PoolClientSchema>;
