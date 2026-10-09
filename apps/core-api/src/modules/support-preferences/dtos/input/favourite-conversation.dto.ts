import { z } from 'zod';

import { FavouriteRequestSchema } from '../request/favourite-request.dto';
import { ReadConversationSchema } from '../../../support';

export const FavouriteConversationSchema = ReadConversationSchema.extend(FavouriteRequestSchema.shape);

export type FavouriteConversationDto = z.infer<typeof FavouriteConversationSchema>;
