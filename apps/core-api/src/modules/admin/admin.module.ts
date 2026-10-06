import { Module } from '@nestjs/common';

import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { GetAdminDashboardUseCase } from './use-cases/queries/get-admin-dashboard.use-case';
import { ListAdminUsersUseCase } from './use-cases/queries/list-admin-users.use-case';
import { GetSharedDevicesUseCase } from './use-cases/queries/get-shared-devices.use-case';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [SharedModule, UserModule, AuthModule, WalletModule],
  controllers: [AdminController],
  providers: [AdminService, GetAdminDashboardUseCase, ListAdminUsersUseCase, GetSharedDevicesUseCase],
  exports: [AdminService]
})
export class AdminModule {}
