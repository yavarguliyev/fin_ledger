import { z } from 'zod';
import { Registry } from 'prom-client';
import { PostgresService } from '@common/libs';

export const MetricsSourceSchema = z.object({
  registry: z.custom<Registry>(),
  postgresService: z.custom<PostgresService>()
});

export type MetricsSourceDto = z.infer<typeof MetricsSourceSchema>;
