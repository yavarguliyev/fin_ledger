import { InternalServerErrorException } from '@nestjs/common';
import { AccountType, APP_CONSTANTS, AUTH_CONSTANTS, DomainEventType, SessionHelper, UserRoles } from '@common/libs';

import { CreateSessionResponseDto } from '../dtos/helper/create-session-response.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { CreateUserWalletAndLedgerDto } from '../dtos/helper/create-user-wallet-and-ledger.dto';
import { UserWalletAndLedgerDto } from '../dtos/helper/user-wallet-and-ledger.dto';
import { MfaPolicyHelper } from './mfa-policy.helper';

export class AuthHelper {
  static async createSessionResponse (options: CreateSessionResponseDto): Promise<AuthResponseDto> {
    const { dto, sessionService, configService, refreshToken } = options;

    const accessToken = await sessionService.createSession({
      session: {
        userId: dto.id,
        email: dto.email,
        role: dto.role as UserRoles,
        status: dto.status,
        displayName: dto.displayName,
        profileImagesKey: dto.profileImagesKey,
        profileImages: dto.profileImages,
        profileImageIndex: dto.profileImageIndex,
        isEmailVerified: dto.isEmailVerified,
        deletedAt: dto.deletedAt
      }
    });

    const configured = configService && typeof configService.get === 'function' ? configService.get<string>('JWT_EXPIRES_IN') : undefined;
    const expiresIn = SessionHelper.parseExpiryToSeconds({ expiry: configured ?? AUTH_CONSTANTS.DEFAULT_ACCESS_EXPIRY });

    const user = {
      id: dto.id,
      email: dto.email,
      displayName: dto.displayName,
      role: dto.role,
      profileImagesKey: dto.profileImagesKey,
      profileImages: dto.profileImages,
      profileImageIndex: dto.profileImageIndex,
      countryCode: dto.countryCode ?? null,
      dateOfBirth: dto.dateOfBirth ?? null,
      kycStatus: dto.kycStatus ?? null,
      lastLoginAt: dto.lastLoginAt ?? null,
      createdAt: dto.createdAt,
      mfaSetupRequired: MfaPolicyHelper.setupRequired({ role: dto.role, mfaEnabledAt: dto.mfaEnabledAt }),
      selfExclusionUntil: dto.selfExclusionUntil ?? null
    };

    return { tokenType: AUTH_CONSTANTS.TOKEN_TYPE, accessToken, expiresIn, ...(refreshToken && { refreshToken }), user };
  }

  static async createUserWalletAndLedger (options: CreateUserWalletAndLedgerDto): Promise<UserWalletAndLedgerDto> {
    const { dto, tx, passwordHash, authRepository, outboxRepository, ledgerService, walletService } = options;

    const user = await authRepository.createUser({
      email: dto.email,
      passwordHash,
      role: UserRoles.USER,
      displayName: dto.displayName,
      termsAcceptedAt: new Date().toISOString(),
      adapter: tx
    });

    if (!user) throw new InternalServerErrorException('Failed to create user');

    const ledgerAccount = await ledgerService.createAccount({
      userId: user.id,
      accountType: AccountType.LIABILITY,
      currency: APP_CONSTANTS.DEFAULT_CURRENCY,
      adapter: tx
    });

    const wallet = await walletService.createWallet({
      userId: user.id,
      ledgerAccountId: ledgerAccount.id,
      currency: APP_CONSTANTS.DEFAULT_CURRENCY,
      availableBalanceMinor: 0,
      reservedBalanceMinor: 0,
      adapter: tx
    });

    await outboxRepository.createEvent({
      aggregateType: 'User',
      aggregateId: user.id,
      eventType: DomainEventType.USER_REGISTERED,
      payload: {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        walletId: wallet.id,
        ledgerAccountId: ledgerAccount.id
      },
      adapter: tx
    });

    return { user, walletId: wallet.id, ledgerAccountId: ledgerAccount.id };
  }
}
