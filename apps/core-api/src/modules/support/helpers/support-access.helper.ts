import { STAFF_ROLES, UserRoles } from '@common/libs';

import { ConversationAccessDto } from '../dtos/input/conversation-access.dto';
import { RoleRefDto } from '../dtos/input/role-ref.dto';

export class SupportAccessHelper {
  static isStaff ({ role }: RoleRefDto): boolean {
    return STAFF_ROLES.includes(role as UserRoles);
  }

  static canAccess ({ conversation, userId, role }: ConversationAccessDto): boolean {
    if (conversation.customerUserId === userId || conversation.assignedStaffId === userId) return true;
    return !conversation.assignedStaffId && SupportAccessHelper.isStaff({ role });
  }
}
