import { Module } from '@nestjs/common';

import { AdminRecipientRepository } from './repositories/admin-recipient.repository';
import { MonitoringController } from './controllers/monitoring.controller';
import { MonitoringService } from './services/monitoring.service';
import { NotificationModule } from '../notification/notification.module';
import { ReceiveAlertsUseCase } from './use-cases/commands/receive-alerts.use-case';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule, NotificationModule],
  controllers: [MonitoringController],
  providers: [MonitoringService, ReceiveAlertsUseCase, AdminRecipientRepository]
})
export class MonitoringModule {}
