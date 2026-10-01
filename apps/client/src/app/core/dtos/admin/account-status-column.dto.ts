import { UserToggleDto } from './user-toggle.dto';

export interface AccountStatusColumnDto {
  onAccountStatusToggle: (dto: UserToggleDto) => void;
  currentUserId: string | null;
}
