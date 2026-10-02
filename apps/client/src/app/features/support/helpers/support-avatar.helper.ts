import { NameRefDto } from '../interfaces/name-ref.interface';
import { SUPPORT_VIEW } from '../constants/support-view.constant';

export class SupportAvatarHelper {
  static initials ({ name }: NameRefDto): string {
    const parts = (name ?? SUPPORT_VIEW.FALLBACK_NAME).trim().split(/\s+/).slice(0, 2);
    return parts.map(part => part.charAt(0).toUpperCase()).join('') || SUPPORT_VIEW.FALLBACK_INITIAL;
  }

  static roleLabel ({ role }: { role: string }): string {
    return role.replace(SUPPORT_VIEW.UNDERSCORE, SUPPORT_VIEW.SPACE).toLowerCase();
  }
}
