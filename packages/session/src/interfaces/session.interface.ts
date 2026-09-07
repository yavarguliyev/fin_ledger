import { Request } from 'express';
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

export interface JwtPayload extends SessionData {
  readonly jti: string;
}

export interface ExpressReqFields extends SessionData {
  readonly url?: string;
}

export interface RequestContext extends Request {
  user: SessionData;
}
