import { UserIdRefDto } from '../user/user-id-ref.dto';
import { WalletToggleDto } from './wallet-toggle.dto';
import { UserToggleDto } from './user-toggle.dto';

export interface ToggleColumnsDto {
  onStatusToggle: (dto: WalletToggleDto) => void;
  onEmailVerificationToggle: (dto: UserToggleDto) => void;
  onDeletedToggle: (dto: UserIdRefDto) => void;
}
