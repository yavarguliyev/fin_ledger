import { PageRequestDto } from '../common/page-request.dto';

export interface WalletTransactionsDto extends PageRequestDto {
  walletId: string;
}
