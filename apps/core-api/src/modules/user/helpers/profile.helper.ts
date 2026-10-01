import { PROFILE_FIELDS } from '../constants/profile/profile-fields.constant';
import { DateOfBirthDto } from '../dtos/profile/date-of-birth.dto';

export class ProfileHelper {
  static ageOn ({ dateOfBirth }: DateOfBirthDto): number | null {
    const born = new Date(dateOfBirth);
    if (Number.isNaN(born.getTime())) return null;

    const now = new Date();
    const years = now.getFullYear() - born.getFullYear();
    const reachedThisYear = now.getMonth() > born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());

    return reachedThisYear ? years : years - 1;
  }

  static isRealisticAge ({ dateOfBirth }: DateOfBirthDto): boolean {
    const age = ProfileHelper.ageOn({ dateOfBirth });
    return age !== null && age >= PROFILE_FIELDS.MIN_AGE_YEARS && age <= PROFILE_FIELDS.MAX_AGE_YEARS;
  }
}
