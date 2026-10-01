import { z } from 'zod';
import { NotificationTitle } from '@common/libs';

export const EventTitleSchema = z.enum(NotificationTitle, { message: 'Event title must be a known notification title' });

export type EventTitleDto = z.infer<typeof EventTitleSchema>;
