import { Module } from '@nestjs/common';
import { ClientIds, StorageModule } from '@common/libs';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserUseCase } from './use-cases/commands/update-user.use-case';
import { UploadFilesUseCase } from './use-cases/commands/upload-files.use-case';
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
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UpdateUserUseCase,
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
  exports: [UserService, UserRepository]
})
export class UserModule {}
