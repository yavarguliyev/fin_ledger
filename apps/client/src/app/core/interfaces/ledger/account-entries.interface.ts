import { PageRequestDto } from '../common/page-request.interface';

export interface AccountEntriesDto extends PageRequestDto {
  accountId: string;
}
