import { UserReferenceDto } from '../dtos/helper/user-reference.dto';
import { USER_CONSTANTS } from '../constants/anonymization/user.constant';
import { CurrentUserDto } from '../dtos/user/current-user.dto';

export class UserHelper {
  static isAnonymized ({ user }: UserReferenceDto): boolean {
    return user.email.endsWith(`@${USER_CONSTANTS.ANONYMIZED_EMAIL_DOMAIN}`);
  }

  static toCurrentUser ({ user }: UserReferenceDto): CurrentUserDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      profileImagesKey: user.profileImagesKey,
      profileImages: user.profileImages,
      profileImageIndex: user.profileImageIndex,
      countryCode: user.countryCode ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
      kycStatus: user.kycStatus ?? null,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp ?? null,
      selfExclusionUntil: user.selfExclusionUntil ?? null,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
