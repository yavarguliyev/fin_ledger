import { EventContract } from '../interfaces/event-contract.interface';
import { BetSettledV1Schema } from './bet-settled-v1.contract';
import { EVENT_TYPES as T, EVENT_VERSIONS as V } from './event-type-values.contract';
import { PaymentCompletedV1Schema } from './payment-completed-v1.contract';
import { PaymentFailedV1Schema } from './payment-failed-v1.contract';
import { PaymentMethodStatusV1Schema } from './payment-method-status-v1.contract';
import { UserRegisteredV1Schema } from './user-registered-v1.contract';
import { WalletMovementV1Schema } from './wallet-movement-v1.contract';

export const EVENT_CONTRACTS: Readonly<Record<string, EventContract>> = {
  [T.USER_REGISTERED]: { version: V.V1, schema: UserRegisteredV1Schema },
  [T.BET_SETTLED]: { version: V.V1, schema: BetSettledV1Schema },
  [T.PAYMENT_COMPLETED]: { version: V.V1, schema: PaymentCompletedV1Schema },
  [T.ANALYTICS_PAYMENT_COMPLETED]: { version: V.V1, schema: PaymentCompletedV1Schema },
  [T.PAYMENT_FAILED]: { version: V.V1, schema: PaymentFailedV1Schema },
  [T.ANALYTICS_PAYMENT_FAILED]: { version: V.V1, schema: PaymentFailedV1Schema },
  [T.PAYMENT_METHOD_VERIFIED]: { version: V.V1, schema: PaymentMethodStatusV1Schema },
  [T.PAYMENT_METHOD_REJECTED]: { version: V.V1, schema: PaymentMethodStatusV1Schema },
  [T.WALLET_CREDITED]: { version: V.V1, schema: WalletMovementV1Schema },
  [T.WALLET_DEBITED]: { version: V.V1, schema: WalletMovementV1Schema },
  [T.ANALYTICS_WALLET_CREDITED]: { version: V.V1, schema: WalletMovementV1Schema },
  [T.ANALYTICS_WALLET_DEBITED]: { version: V.V1, schema: WalletMovementV1Schema }
};
