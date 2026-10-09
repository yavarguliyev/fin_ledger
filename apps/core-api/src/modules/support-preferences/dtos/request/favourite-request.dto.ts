import { z } from 'zod';

export const FavouriteRequestSchema = z.object({
  favourite: z.boolean({ message: 'Favourite must be true or false' })
});

export type FavouriteRequestDto = z.infer<typeof FavouriteRequestSchema>;
