import { UserToggleDto } from './user-toggle.interface';

export interface AccountStatusColumnDto {
  onAccountStatusToggle: (dto: UserToggleDto) => void;
  currentUserId: string | null;
}
