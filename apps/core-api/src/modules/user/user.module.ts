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
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';
import { FxModule } from '../fx-rate/fx.module';
import { WalletCurrencyConversionModule } from '../wallet-currency-conversion/wallet-currency-conversion.module';
import { UserCreateUseCase } from './use-cases/commands/user-create.use-case';
import { DeleteUserFromDbUseCase } from './use-cases/commands/delete-user-from-db.use-case';

@Module({
  imports: [
    SharedModule,
    StorageModule.forRoot(ClientIds.API_GATEWAY),
    AuthModule,
    WalletModule,
    LedgerModule,
    FxModule,
    WalletCurrencyConversionModule
  ],
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
    UpdateEmailVerificationUseCase
  ],
  exports: [UserService, UserRepository]
})
export class UserModule {}
