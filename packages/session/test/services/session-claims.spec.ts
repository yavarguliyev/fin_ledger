import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { CacheProvider } from '@common/redis';
import { CryptoHelper, UserRoles, UserStatus } from '@common/shared-libs';

import { JwtPayload } from '../../src/modules/interfaces/jwt-payload.interface';
import { SessionData } from '../../src/modules/interfaces/session-data.interface';
import { SessionService } from '../../src/modules/services/session.service';
import { SESSION_CLAIMS_SPEC as S } from '../constants/session-claims.constant';

const { publicKey, privateKey } = CryptoHelper.generateRsaKeyPair();

const settings: Record<string, string> = { [S.PRIVATE_KEY]: privateKey, [S.PUBLIC_KEY]: publicKey, [S.EXPIRES_KEY]: S.EXPIRES_IN };

const service = new SessionService(
  { get: (key: string) => settings[key] } as unknown as ConfigService,
  { set: () => Promise.resolve() } as unknown as CacheProvider
);

const session: SessionData = {
  userId: S.USER_ID,
  email: S.EMAIL,
  displayName: S.NAME,
  profileImagesKey: null,
  profileImages: [],
  profileImageIndex: 0,
  role: UserRoles.ADMIN,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  deletedAt: null
};

describe('SessionService access token claims', () => {
  it('carries the user id as sub and the role in a standard roles claim', async () => {
    const token = await service.createSession({ session });
    const payload = jwt.verify(token, publicKey) as JwtPayload;

    expect(payload.sub).toBe(S.USER_ID);
    expect(payload.roles).toEqual([UserRoles.ADMIN]);
    expect(payload.userId).toBe(S.USER_ID);
  });
});
