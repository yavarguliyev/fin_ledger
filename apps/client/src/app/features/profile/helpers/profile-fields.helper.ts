import { ProfileFields } from '../../../core/types/auth/profile-fields.type';
import { ProfileFieldsChangeDto } from '../dtos/profile-fields-change.dto';
import { ProfileFieldsRefDto } from '../dtos/profile-fields-ref.dto';

export class ProfileFieldsHelper {
  static normalize ({ fields }: ProfileFieldsRefDto): ProfileFields {
    return {
      displayName: (fields.displayName ?? '').trim(),
      countryCode: (fields.countryCode ?? '').trim().toUpperCase(),
      dateOfBirth: (fields.dateOfBirth ?? '').trim()
    };
  }

  static hasChanged ({ initial, current }: ProfileFieldsChangeDto): boolean {
    const left = ProfileFieldsHelper.normalize({ fields: initial });
    const right = ProfileFieldsHelper.normalize({ fields: current });

    return left.displayName !== right.displayName || left.countryCode !== right.countryCode || left.dateOfBirth !== right.dateOfBirth;
  }
}
