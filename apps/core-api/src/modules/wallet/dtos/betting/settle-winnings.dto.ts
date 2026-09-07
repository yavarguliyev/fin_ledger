import { z } from 'zod';

import { CreditDebitSchema } from '../balance-operation/credit-debit.dto';

export type SettleWinningsDto = z.infer<typeof CreditDebitSchema>;
