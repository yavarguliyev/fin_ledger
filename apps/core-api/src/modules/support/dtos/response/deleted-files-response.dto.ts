import { z } from 'zod';

export const DeletedFilesResponseSchema = z.object({
  deleted: z.number({ message: 'Deleted must be a number' }).int()
});

export type DeletedFilesResponseDto = z.infer<typeof DeletedFilesResponseSchema>;
