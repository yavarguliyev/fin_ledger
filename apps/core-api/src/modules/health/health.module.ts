import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { SharedModule } from '../../shared/shared.module';
import { HealthController } from './controllers/health.controller';
import { BrokerHealthIndicator } from './indicators/broker.health-indicator';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';

@Module({
  imports: [SharedModule, TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, RedisHealthIndicator, BrokerHealthIndicator]
})
export class HealthModule {}
