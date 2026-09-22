import { DisplayName } from '../base/display-name.interface';
import { Email } from '../base/email.interface';
import { Id } from '../base/id.interface';
import { Roles } from '../base/roles.interface';

export interface AuthUser extends Id, Email, DisplayName, Roles {
  profileImagesKey: string | null;
  profileImages: string[];
  profileImageIndex: number;
}
