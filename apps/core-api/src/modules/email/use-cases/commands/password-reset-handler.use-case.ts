import { Injectable } from '@nestjs/common';
import { EmailProviderService, EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class PasswordResetHandler extends EmailBaseHandler<SendEmailDto> {
  constructor (emailService: EmailProviderService) {
    super(PasswordResetHandler.name, emailService);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.PASSWORD_RESET })
  override handle (message: KafkaMessageRecord<SendEmailDto>): void {
    super.handle(message);
  }
}
