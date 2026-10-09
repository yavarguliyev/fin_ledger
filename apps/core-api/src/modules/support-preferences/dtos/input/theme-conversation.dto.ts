import { z } from 'zod';

import { ThemeRequestSchema } from '../request/theme-request.dto';
import { ReadConversationSchema } from '../../../support';

export const ThemeConversationSchema = ReadConversationSchema.extend(ThemeRequestSchema.shape);

export type ThemeConversationDto = z.infer<typeof ThemeConversationSchema>;
