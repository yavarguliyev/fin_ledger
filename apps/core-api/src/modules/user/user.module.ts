import { Module } from '@nestjs/common';
import { ClientIds, StorageModule } from '@common/libs';

import { UserController } from './user.controller';
import { UserAdminController } from './user-admin.controller';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserUseCase } from './use-cases/commands/update-user.use-case';
import { SetSelfExclusionUseCase } from './use-cases/commands/set-self-exclusion.use-case';
import { SetDepositLimitUseCase } from './use-cases/commands/set-deposit-limit.use-case';
import { GetDepositLimitsUseCase } from './use-cases/queries/get-deposit-limits.use-case';
import { AssertDepositAllowedUseCase } from './use-cases/queries/assert-deposit-allowed.use-case';
import { DepositLimitRepository } from './repositories/deposit-limit.repository';
import { UploadFilesUseCase } from './use-cases/commands/upload-files.use-case';
import { GetCurrentUserUseCase } from './use-cases/queries/get-current-user.use-case';
import { GetImagesUseCase } from './use-cases/queries/get-images.use-case';
import { DeleteImagesUseCase } from './use-cases/commands/delete-user-images.use-case';
import { DeleteUserUseCase } from './use-cases/commands/delete-user.use-case';
import { UpdateEmailVerificationUseCase } from './use-cases/commands/update-email-verification.use-case';
import { ChangeUserStatusUseCase } from './use-cases/commands/change-user-status.use-case';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';
import { UserCreateUseCase } from './use-cases/commands/user-create.use-case';
import { DeleteUserFromDbUseCase } from './use-cases/commands/delete-user-from-db.use-case';
import { AnonymizeUserUseCase } from './use-cases/commands/anonymize-user.use-case';

@Module({
  imports: [SharedModule, StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY }), AuthModule, WalletModule, LedgerModule],
  controllers: [UserController, UserAdminController],
  providers: [
    UserService,
    UserRepository,
    GetCurrentUserUseCase,
    UpdateUserUseCase,
    SetSelfExclusionUseCase,
    SetDepositLimitUseCase,
    GetDepositLimitsUseCase,
    AssertDepositAllowedUseCase,
    DepositLimitRepository,
    UploadFilesUseCase,
    GetImagesUseCase,
    DeleteImagesUseCase,
    UserCreateUseCase,
    DeleteUserUseCase,
    DeleteUserFromDbUseCase,
    AnonymizeUserUseCase,
    UpdateEmailVerificationUseCase,
    ChangeUserStatusUseCase
  ],
  exports: [UserService, UserRepository, AssertDepositAllowedUseCase]
})
export class UserModule {}
