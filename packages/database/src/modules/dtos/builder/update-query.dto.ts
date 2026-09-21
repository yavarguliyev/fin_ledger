import { z } from 'zod';
import { EntityData, EntityId } from '@common/shared-libs';

export const UpdateQuerySchema = z.object({
  id: z.custom<EntityId>(),

  data: z.custom<EntityData>(),

  returningColumns: z.array(z.string())
});

export type UpdateQueryDto = z.infer<typeof UpdateQuerySchema>;
