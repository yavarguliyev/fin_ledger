import { Injectable } from '@nestjs/common';
import { EmailProviderService, EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class UserRegisterHandler extends EmailBaseHandler<SendEmailDto> {
  constructor (emailService: EmailProviderService) {
    super(UserRegisterHandler.name, emailService);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.EMAIL_VERIFICATION })
  override handle (message: KafkaMessageRecord<SendEmailDto>): void {
    super.handle(message);
  }
}
