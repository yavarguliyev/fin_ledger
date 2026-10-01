import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class EmailChangedNoticeHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(EmailChangedNoticeHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.EMAIL_CHANGED_NOTICE })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
