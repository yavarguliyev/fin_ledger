import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class NewDeviceHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(NewDeviceHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.NEW_DEVICE })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
