import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class MonitoringAlertHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(MonitoringAlertHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.MONITORING_ALERT })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
