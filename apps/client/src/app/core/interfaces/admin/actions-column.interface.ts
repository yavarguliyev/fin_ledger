import { UserIdRefDto } from '../user/user-id-ref.interface';

export interface ActionsColumnDto {
  onView: (dto: UserIdRefDto) => void;
  onAnonymize: (dto: UserIdRefDto) => void;
  showDelete: boolean;
}
