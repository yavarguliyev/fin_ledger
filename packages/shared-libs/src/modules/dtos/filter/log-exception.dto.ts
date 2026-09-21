import { z } from 'zod';

import { LogExceptionRecord } from '../../interfaces/log-exception-record.interface';
import { MapExceptionSchema } from './map-exception.dto';

export const LogExceptionSchema = MapExceptionSchema.extend({
  request: z.custom<LogExceptionRecord>()
});

export type LogExceptionDto = z.infer<typeof LogExceptionSchema>;
