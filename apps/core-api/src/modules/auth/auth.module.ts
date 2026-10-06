import { Module } from '@nestjs/common';
import { MfaModule } from '@common/libs';

import { AuthController } from './controllers/auth.controller';
import { AuthMfaController } from './controllers/auth-mfa.controller';
import { AuthPasskeyController } from './controllers/auth-passkey.controller';
import { AuthKeysController } from './controllers/auth-keys.controller';
import { GetJwksUseCase } from './use-cases/queries/get-jwks.use-case';
import { TrackDeviceUseCase } from './use-cases/commands/device/track-device.use-case';
import { ListSharedDevicesUseCase } from './use-cases/queries/list-shared-devices.use-case';
import { PasskeyRegistrationUseCase } from './use-cases/commands/passkeys/passkey-registration.use-case';
import { PasskeyLoginUseCase } from './use-cases/commands/passkeys/passkey-login.use-case';
import { RemovePasskeyUseCase } from './use-cases/commands/passkeys/remove-passkey.use-case';
import { ListPasskeysUseCase } from './use-cases/queries/list-passkeys.use-case';
import { UserCredentialRepository } from './repositories/user-credential.repository';
import { PasskeyChallengeService } from './services/passkey-challenge.service';
import { PasskeyService } from './services/passkey.service';
import { PasskeyStepUpService } from './services/passkey-step-up.service';
import { PasskeyStepUpUseCase } from './use-cases/commands/passkeys/passkey-step-up.use-case';
import { PasskeyGrantService } from './services/passkey-grant.service';
import { AssertPasskeyStepUpUseCase } from './use-cases/commands/passkeys/assert-passkey-step-up.use-case';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { AuthTokenRepository } from './repositories/auth-token.repository';
import { MfaRecoveryCodeRepository } from './repositories/mfa-recovery-code.repository';
import { UserDeviceRepository } from './repositories/user-device.repository';
import { LoginEventRepository } from './repositories/login-event.repository';
import { DeviceTrackerService } from './services/device-tracker.service';
import { GetMfaStatusUseCase } from './use-cases/queries/get-mfa-status.use-case';
import { SetupMfaUseCase } from './use-cases/commands/mfa/setup-mfa.use-case';
import { EnableMfaUseCase } from './use-cases/commands/mfa/enable-mfa.use-case';
import { DisableMfaUseCase } from './use-cases/commands/mfa/disable-mfa.use-case';
import { VerifyMfaLoginUseCase } from './use-cases/commands/mfa/verify-mfa-login.use-case';
import { RegenerateRecoveryCodesUseCase } from './use-cases/commands/mfa/regenerate-recovery-codes.use-case';
import { LoginUseCase } from './use-cases/commands/login.use-case';
import { RegisterUserUseCase } from './use-cases/commands/register-user.use-case';
import { LogoutUseCase } from './use-cases/commands/logout.use-case';
import { LogoutEverywhereUseCase } from './use-cases/commands/logout-everywhere.use-case';
import { RefreshSessionUseCase } from './use-cases/commands/refresh-session.use-case';
import { ChangePasswordUseCase } from './use-cases/commands/account/change-password.use-case';
import { ChangeEmailUseCase } from './use-cases/commands/account/change-email.use-case';
import { ConfirmEmailChangeUseCase } from './use-cases/commands/account/confirm-email-change.use-case';
import { ValidateSessionUseCase } from './use-cases/commands/validate-session.use-case';
import { SharedModule } from '../../shared/shared.module';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletModule } from '../wallet/wallet.module';
import { SupportModule } from '../support/support.module';
import { AuthChatLockController } from './controllers/auth-chat-lock.controller';
import { ChatLockService } from './services/chat-lock.service';
import { ConsumePasskeyGrantUseCase } from './use-cases/commands/passkeys/consume-passkey-grant.use-case';
import { LockChatUseCase } from './use-cases/commands/passkeys/lock-chat.use-case';
import { UnlockChatUseCase } from './use-cases/commands/passkeys/unlock-chat.use-case';
import { EmailVerificationUseCase } from './use-cases/commands/email-verification.use-case';
import { ForgotPasswordUseCase } from './use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/commands/reset-password.use-case';

@Module({
  imports: [SharedModule, LedgerModule, SupportModule, WalletModule, MfaModule.forRoot()],
  controllers: [AuthController, AuthMfaController, AuthPasskeyController, AuthKeysController, AuthChatLockController],
  providers: [
    AuthService,
    EmailVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RegisterUserUseCase,
    LoginUseCase,
    LogoutUseCase,
    LogoutEverywhereUseCase,
    RefreshSessionUseCase,
    ChangePasswordUseCase,
    ChangeEmailUseCase,
    ConfirmEmailChangeUseCase,
    ValidateSessionUseCase,
    GetMfaStatusUseCase,
    SetupMfaUseCase,
    EnableMfaUseCase,
    DisableMfaUseCase,
    VerifyMfaLoginUseCase,
    RegenerateRecoveryCodesUseCase,
    PasskeyRegistrationUseCase,
    PasskeyLoginUseCase,
    ListPasskeysUseCase,
    RemovePasskeyUseCase,
    UserCredentialRepository,
    PasskeyChallengeService,
    PasskeyService,
    PasskeyStepUpService,
    ChatLockService,
    ConsumePasskeyGrantUseCase,
    LockChatUseCase,
    UnlockChatUseCase,
    PasskeyStepUpUseCase,
    AssertPasskeyStepUpUseCase,
    PasskeyGrantService,
    GetJwksUseCase,
    TrackDeviceUseCase,
    ListSharedDevicesUseCase,
    AuthRepository,
    AuthTokenRepository,
    MfaRecoveryCodeRepository,
    UserDeviceRepository,
    LoginEventRepository,
    DeviceTrackerService
  ],
  exports: [AuthService, AuthRepository, AuthTokenRepository, DeviceTrackerService, PasskeyStepUpService]
})
export class AuthModule {}
