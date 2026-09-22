import { z } from 'zod';

export const EventTitleSchema = z.enum(['Bet Won', 'Payment Completed', 'Payment Failed', 'Welcome!', 'Wallet Credited', 'Wallet Debited'], {
  message: 'Event title must be a known notification title'
});

export type EventTitleDto = z.infer<typeof EventTitleSchema>;
