import { UserRoles } from '@common/libs';

import { MFA_POLICY } from '../constants/mfa/mfa-policy.constant';
import { MfaPolicyDto } from '../dtos/helper/mfa-policy.dto';

export class MfaPolicyHelper {
  static isRequired ({ role }: MfaPolicyDto): boolean {
    return !!role && MFA_POLICY.REQUIRED_ROLES.includes(role as UserRoles);
  }

  static setupRequired ({ role, mfaEnabledAt }: MfaPolicyDto): boolean {
    return MfaPolicyHelper.isRequired({ role }) && !mfaEnabledAt;
  }
}
