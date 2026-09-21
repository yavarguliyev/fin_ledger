import { UserReferenceDto } from '../dtos/helper/user-reference.dto';
import { USER_CONSTANTS } from '../constants/user.constant';

export class UserHelper {
  static isAnonymized ({ user }: UserReferenceDto): boolean {
    return user.email.endsWith(`@${USER_CONSTANTS.ANONYMIZED_EMAIL_DOMAIN}`);
  }
}
