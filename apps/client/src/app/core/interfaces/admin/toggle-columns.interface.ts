import { UserIdRefDto } from '../user/user-id-ref.interface';
import { WalletToggleDto } from './wallet-toggle.interface';
import { UserToggleDto } from './user-toggle.interface';

export interface ToggleColumnsDto {
  onStatusToggle: (dto: WalletToggleDto) => void;
  onEmailVerificationToggle: (dto: UserToggleDto) => void;
  onDeletedToggle: (dto: UserIdRefDto) => void;
}
