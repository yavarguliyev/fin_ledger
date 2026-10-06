import { z } from 'zod';

export const SecretValuesSchema = z.record(z.string(), z.string());

export type SecretValuesDto = z.infer<typeof SecretValuesSchema>;
