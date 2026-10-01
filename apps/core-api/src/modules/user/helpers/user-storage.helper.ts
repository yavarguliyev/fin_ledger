import { USER_STORAGE } from '../constants/storage/user-storage.constant';
import { UserIdRefDto } from '../dtos/storage/user-id-ref.dto';

export class UserStorageHelper {
  static profileImagesKey ({ userId }: UserIdRefDto): string {
    return `${USER_STORAGE.PROFILE_IMAGES_PREFIX}${userId}`;
  }
}
