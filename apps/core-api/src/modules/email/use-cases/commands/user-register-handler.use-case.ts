import { Injectable } from '@nestjs/common';
import { MailerService, EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class UserRegisterHandler extends EmailBaseHandler<SendEmailDto> {
  constructor (mailerService: MailerService) {
    super(UserRegisterHandler.name, mailerService);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.EMAIL_VERIFICATION })
  override handle (message: KafkaMessageRecord<SendEmailDto>): void {
    super.handle(message);
  }
}
