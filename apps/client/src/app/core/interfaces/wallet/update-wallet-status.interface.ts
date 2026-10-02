import { WalletStatus } from '../../types/wallet/wallet-status.type';

export interface UpdateWalletStatusDto {
  walletId: string;
  status: WalletStatus;
}
