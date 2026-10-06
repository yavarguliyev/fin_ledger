import { z } from 'zod';

import { SUPPORT_MESSAGE_KINDS } from '@common/contracts';

import { PanelPageSchema } from './panel-page.dto';

export const PanelFilesSchema = PanelPageSchema.extend({
  kinds: z.array(z.enum(SUPPORT_MESSAGE_KINDS), { message: 'Kinds must be a list of message kinds' })
});

export type PanelFilesDto = z.infer<typeof PanelFilesSchema>;
