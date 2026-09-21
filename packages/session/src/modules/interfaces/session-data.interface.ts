import { UserRoles } from '@common/shared-libs';

export interface SessionData {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly profileImagesKey: string | null;
  readonly profileImages: string[];
  readonly profileImageIndex: number;
  readonly role?: UserRoles;
  readonly isEmailVerified: boolean;
  readonly deletedAt: string | null;
}
