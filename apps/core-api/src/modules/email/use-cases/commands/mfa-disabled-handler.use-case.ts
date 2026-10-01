import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class MfaDisabledHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(MfaDisabledHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.MFA_DISABLED })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
