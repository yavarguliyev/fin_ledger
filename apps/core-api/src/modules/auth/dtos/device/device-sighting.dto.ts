import { z } from 'zod';

export const DeviceSightingSchema = z.object({ isNewDevice: z.boolean({ message: 'Is new device must be a boolean' }) });

export type DeviceSightingDto = z.infer<typeof DeviceSightingSchema>;
