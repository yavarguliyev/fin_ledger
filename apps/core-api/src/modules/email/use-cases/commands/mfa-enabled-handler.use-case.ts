import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class MfaEnabledHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(MfaEnabledHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.MFA_ENABLED })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
