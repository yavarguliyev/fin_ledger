import { Injectable } from '@nestjs/common';
import { MailerService, EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class PasswordResetHandler extends EmailBaseHandler<SendEmailDto> {
  constructor (mailerService: MailerService) {
    super(PasswordResetHandler.name, mailerService);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.PASSWORD_RESET })
  override handle (message: KafkaMessageRecord<SendEmailDto>): void {
    super.handle(message);
  }
}
