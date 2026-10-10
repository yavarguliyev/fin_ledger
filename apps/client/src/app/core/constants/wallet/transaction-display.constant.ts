import { IconName } from '../../types/ui/icon-name.type';

export const TRANSACTION_DISPLAY_FALLBACK = {
  ICON: 'wallet'
} as const;

export const TRANSACTION_ICONS: Record<string, IconName> = {
  DEPOSIT: 'arrow-down-to-line',
  WITHDRAWAL: 'arrow-up-from-line',
  BET_STAKE: 'target',
  BET_PAYOUT: 'trophy',
  BET_REFUND: 'undo-2',
  FEE: 'circle-minus',
  ADJUSTMENT: 'scale'
};
