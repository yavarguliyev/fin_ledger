import { DisplayName } from '../base/display-name.interface';
import { Email } from '../base/email.interface';
import { Roles } from '../base/roles.interface';
import { UserId } from '../base/user-id.interface';

export interface SessionData extends Email, DisplayName, Roles, UserId {}
