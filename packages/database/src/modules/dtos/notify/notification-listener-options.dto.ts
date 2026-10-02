import { z } from 'zod';
import type { DatabaseConfig } from '../../interfaces/database-config.interface';

import { ListenSchema } from './listen.dto';

export const NotificationListenerOptionsSchema = ListenSchema.extend({ config: z.custom<DatabaseConfig>() });

export type NotificationListenerOptionsDto = z.infer<typeof NotificationListenerOptionsSchema>;
