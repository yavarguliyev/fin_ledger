import { PageRequestDto } from '../common/page-request.dto';

export interface AccountEntriesDto extends PageRequestDto {
  accountId: string;
}
