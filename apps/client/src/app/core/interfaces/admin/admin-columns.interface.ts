import { UserIdRefDto } from '../user/user-id-ref.interface';
import { WalletToggleDto } from './wallet-toggle.interface';
import { UserToggleDto } from './user-toggle.interface';

export interface AdminColumnsDto {
  onStatusToggle: (dto: WalletToggleDto) => void;
  onEmailVerificationToggle: (dto: UserToggleDto) => void;
  onDeletedToggle: (dto: UserIdRefDto) => void;
  onView: (dto: UserIdRefDto) => void;
  onAnonymize: (dto: UserIdRefDto) => void;
  onAccountStatusToggle: (dto: UserToggleDto) => void;
  isGlobalAdmin: boolean;
  currentUserId: string | null;
}
