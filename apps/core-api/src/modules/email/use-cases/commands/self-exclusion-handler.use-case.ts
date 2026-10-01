import { Injectable } from '@nestjs/common';
import { EmailTemplateType, KafkaMessageRecord, KafkaSubscribe, SendEmailDto } from '@common/libs';

import { EmailBaseHandler } from '../base/email-base-handler.use-case';

@Injectable()
export class SelfExclusionHandler extends EmailBaseHandler<SendEmailDto> {
  constructor () {
    super(SelfExclusionHandler.name);
  }

  @KafkaSubscribe({ topic: EmailTemplateType.SELF_EXCLUSION_STARTED })
  override async handle (message: KafkaMessageRecord<SendEmailDto>): Promise<void> {
    await super.handle(message);
  }
}
