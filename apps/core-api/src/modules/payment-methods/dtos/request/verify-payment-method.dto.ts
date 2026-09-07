import { z } from 'zod';

import { RemovePaymentMethodSchema } from './remove-payment-method.dto';

export type VerifyPaymentMethodDto = z.infer<typeof RemovePaymentMethodSchema>;
