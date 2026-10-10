import { UserRole } from '../../types/auth/user-role.type';
import { IconName } from '../../types/ui/icon-name.type';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  roles?: readonly UserRole[];
}
