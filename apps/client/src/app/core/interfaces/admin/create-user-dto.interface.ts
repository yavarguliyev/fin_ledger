import { DisplayName } from '../base/display-name.interface';
import { Email } from '../base/email.interface';

export interface CreateUserDto extends Email, DisplayName {
  role: string;
}
