import { ProfileFormRefDto } from './profile-form-ref.interface';

export interface ProfileSaveFailureDto extends ProfileFormRefDto {
  error: unknown;
}
