import { z } from 'zod';
import { EntityId } from '@common/shared-libs';

export const DeleteQuerySchema = z.object({
  id: z.custom<EntityId>()
});

export type DeleteQueryDto = z.infer<typeof DeleteQuerySchema>;
