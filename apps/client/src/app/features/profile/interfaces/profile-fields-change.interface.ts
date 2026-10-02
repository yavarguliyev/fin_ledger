import { ProfileFields } from '../../../core/types/auth/profile-fields.type';

export interface ProfileFieldsChangeDto {
  initial: ProfileFields;
  current: ProfileFields;
}
