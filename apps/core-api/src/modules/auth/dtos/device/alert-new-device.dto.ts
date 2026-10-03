import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { TrackDeviceSchema } from './track-device.dto';

export const AlertNewDeviceSchema = TrackDeviceSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type AlertNewDeviceDto = z.infer<typeof AlertNewDeviceSchema>;
