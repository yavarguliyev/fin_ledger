import { BackendUserWithWallet } from './backend-user-with-wallet.interface';

export interface AdminUserRowsDto {
  rows: BackendUserWithWallet[];
  limit: number;
}
