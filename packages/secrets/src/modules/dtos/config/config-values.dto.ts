import { z } from 'zod';

export const ConfigValuesSchema = z.record(z.string(), z.string());

export type ConfigValuesDto = z.infer<typeof ConfigValuesSchema>;
