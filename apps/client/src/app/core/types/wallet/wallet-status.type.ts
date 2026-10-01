import type { WALLET_STATUSES } from '@common/contracts';

export type WalletStatus = (typeof WALLET_STATUSES)[number];
