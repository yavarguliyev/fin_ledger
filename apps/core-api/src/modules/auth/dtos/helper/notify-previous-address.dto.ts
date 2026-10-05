import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { ChangedEmailSchema } from './changed-email.dto';

export const NotifyPreviousAddressSchema = ChangedEmailSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type NotifyPreviousAddressDto = z.infer<typeof NotifyPreviousAddressSchema>;
