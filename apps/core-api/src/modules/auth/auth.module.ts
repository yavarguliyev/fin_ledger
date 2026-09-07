import { forwardRef, Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { LoginUseCase } from './use-cases/commands/login.use-case';
import { RegisterUserUseCase } from './use-cases/commands/register-user.use-case';
import { LogoutUseCase } from './use-cases/commands/logout.use-case';
import { ValidateSessionUseCase } from './use-cases/commands/validate-session.use-case';
import { SharedModule } from '../../shared/shared.module';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletModule } from '../wallet/wallet.module';
import { EmailVerificationUseCase } from './use-cases/commands/email-verification.use-case';
import { ForgotPasswordUseCase } from './use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/commands/reset-password.use-case';

@Module({
  imports: [SharedModule, LedgerModule, forwardRef(() => WalletModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RegisterUserUseCase,
    LoginUseCase,
    LogoutUseCase,
    ValidateSessionUseCase,
    AuthRepository
  ],
  exports: [AuthService, AuthRepository]
})
export class AuthModule {}
