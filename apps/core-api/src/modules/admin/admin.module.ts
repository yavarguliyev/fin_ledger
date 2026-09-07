import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { GetAdminDashboardUseCase } from './use-cases/queries/get-admin-dashboard.use-case';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { WalletTransactionModule } from '../wallet-transactions/wallet-transaction.module';

@Module({
  imports: [SharedModule, UserModule, AuthModule, WalletTransactionModule],
  controllers: [AdminController],
  providers: [AdminService, GetAdminDashboardUseCase],
  exports: [AdminService]
})
export class AdminModule {}
