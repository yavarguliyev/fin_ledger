import { ProfileFormRefDto } from './profile-form-ref.dto';

export interface ProfileSaveFailureDto extends ProfileFormRefDto {
  error: unknown;
}
