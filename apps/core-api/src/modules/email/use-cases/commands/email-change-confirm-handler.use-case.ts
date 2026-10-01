import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class EmailChangeConfirmHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(EmailChangeConfirmHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.EMAIL_CHANGE_CONFIRM })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
