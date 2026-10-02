import { PageRequestDto } from '../common/page-request.interface';

export interface WalletTransactionsDto extends PageRequestDto {
  walletId: string;
}
