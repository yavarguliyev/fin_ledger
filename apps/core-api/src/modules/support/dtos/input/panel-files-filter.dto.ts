import { z } from 'zod';

import { SUPPORT_MESSAGE_KINDS } from '@common/contracts';

import { PanelPageFilterSchema } from './panel-page-filter.dto';

export const PanelFilesFilterSchema = PanelPageFilterSchema.extend({
  kinds: z.array(z.enum(SUPPORT_MESSAGE_KINDS), { message: 'Kinds must be a list of message kinds' })
});

export type PanelFilesFilterDto = z.infer<typeof PanelFilesFilterSchema>;
