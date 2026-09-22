import { UserRole } from '../../types/auth/user-role.type';
import { DisplayName } from '../base/display-name.interface';
import { Email } from '../base/email.interface';
import { Password } from '../base/password.interface';

export interface RegisterDto extends Email, Password, DisplayName {
  role?: UserRole;
}
