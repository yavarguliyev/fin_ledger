import { z } from 'zod';

import { RemovePaymentMethodSchema } from './remove-payment-method.dto';

export type GetPaymentMethodDto = z.infer<typeof RemovePaymentMethodSchema>;
