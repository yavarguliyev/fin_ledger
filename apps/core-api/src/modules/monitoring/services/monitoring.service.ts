import { Injectable } from '@nestjs/common';

import { ReceiveAlertsDto } from '../dtos/input/receive-alerts.dto';
import { ReceiveAlertsUseCase } from '../use-cases/commands/receive-alerts.use-case';

@Injectable()
export class MonitoringService {
  constructor (private readonly receiveAlertsUseCase: ReceiveAlertsUseCase) {}

  async receiveAlerts (dto: ReceiveAlertsDto): Promise<void> {
    return this.receiveAlertsUseCase.execute(dto);
  }
}
