import { z } from 'zod';

import { ClientIds } from '../../enums/common/client.enum';

export const ClientIdSchema = z.object({
  clientId: z.enum(ClientIds, { message: 'Invalid client id' }).optional()
});

export type ClientIdDto = z.infer<typeof ClientIdSchema>;
