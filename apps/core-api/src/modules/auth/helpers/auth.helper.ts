import { InternalServerErrorException } from '@nestjs/common';
import { AccountType, APP_CONSTANTS, DomainEventType, SessionHelper, UserRoles } from '@common/libs';

import { CreateSessionResponseDto } from '../dtos/helper/create-session-response.dto';
import { SessionResponseDto } from '../dtos/response/session-response.dto';
import { CreateUserWalletAndLedgerDto } from '../dtos/helper/create-user-wallet-and-ledger.dto';
import { UserWalletAndLedgerDto } from '../dtos/helper/user-wallet-and-ledger.dto';

export class AuthHelper {
  static async createSessionResponse (options: CreateSessionResponseDto): Promise<SessionResponseDto> {
    const { dto, sessionService, configService, isAuth = false } = options;

    const accessToken = await sessionService.createSession({
      session: {
        userId: dto.id,
        email: dto.email,
        role: dto.role as UserRoles,
        displayName: dto.displayName,
        profileImagesKey: dto.profileImagesKey,
        profileImages: dto.profileImages,
        profileImageIndex: dto.profileImageIndex,
        isEmailVerified: dto.isEmailVerified,
        deletedAt: dto.deletedAt
      }
    });

    const expiresInConfig = configService && typeof configService.get === 'function' ? configService.get<string>('JWT_EXPIRES_IN') : '7d';
    const expiresIn = SessionHelper.parseExpiryToSeconds({ expiry: expiresInConfig ?? '7d' });

    const user = {
      id: dto.id,
      email: dto.email,
      displayName: dto.displayName,
      role: dto.role,
      profileImagesKey: dto.profileImagesKey,
      profileImages: dto.profileImages,
      profileImageIndex: dto.profileImageIndex
    };

    if (isAuth) return { tokenType: 'Bearer', accessToken, expiresIn, user };
    return { tokenType: 'Bearer', accessToken, expiresIn, user: { ...user, createdAt: dto.createdAt, updatedAt: dto.updatedAt } };
  }

  static async createUserWalletAndLedger (options: CreateUserWalletAndLedgerDto): Promise<UserWalletAndLedgerDto> {
    const { dto, tx, passwordHash, authRepository, outboxRepository, ledgerService, walletService } = options;

    const user = await authRepository.createUser(dto.email, passwordHash, UserRoles.USER, dto.displayName, tx);
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
