import { UserIdRefDto } from '../user/user-id-ref.dto';

export interface ActionsColumnDto {
  onView: (dto: UserIdRefDto) => void;
  onAnonymize: (dto: UserIdRefDto) => void;
  showDelete: boolean;
}
