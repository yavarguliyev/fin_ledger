import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class PasswordChangedHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(PasswordChangedHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.PASSWORD_CHANGED })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
