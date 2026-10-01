import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class UserRegisterHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(UserRegisterHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.EMAIL_VERIFICATION })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
