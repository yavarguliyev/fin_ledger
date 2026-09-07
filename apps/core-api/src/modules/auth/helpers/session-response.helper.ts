import { parseExpiryToSeconds, UserRoles } from '@common/libs';

import { SessionRequestDto, SessionResponseDto } from '../dtos/auth/session-response.dto';

export const createSessionResponse = async (options: SessionRequestDto): Promise<SessionResponseDto> => {
  const { dto, sessionService, configService, isAuth = false, walletId, ledgerAccountId } = options;

  const accessToken = await sessionService.createSession({
    userId: dto.id,
    email: dto.email,
    role: dto.role as UserRoles,
    displayName: dto.displayName,
    profileImagesKey: dto.profileImagesKey,
    profileImages: dto.profileImages,
    profileImageIndex: dto.profileImageIndex,
    isEmailVerified: dto.isEmailVerified,
    deletedAt: dto.deletedAt
  });

  const expiresInConfig = configService.get<string>('JWT_EXPIRES_IN')!;
  const expiresIn = parseExpiryToSeconds(expiresInConfig);

  const user = {
    id: dto.id,
    email: dto.email,
    displayName: dto.displayName,
    role: dto.role,
    profileImagesKey: dto.profileImagesKey,
    profileImages: dto.profileImages,
    profileImageIndex: dto.profileImageIndex,
    walletId: walletId ?? dto.walletId,
    ledgerAccountId: ledgerAccountId ?? dto.ledgerAccountId ?? null
  };

  if (isAuth) return { tokenType: 'Bearer', accessToken, expiresIn, user };
  return { tokenType: 'Bearer', accessToken, expiresIn, user: { ...user, createdAt: dto.createdAt, updatedAt: dto.updatedAt } };
};
