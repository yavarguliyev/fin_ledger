import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService, KafkaMessageRecord, SendEmailDto } from '@common/libs';

import { EmailLinkHelper } from '../../helpers/email-link.helper';
import { SealedEmailSchema } from '../../dtos/link/sealed-email.dto';

export abstract class EmailBaseHandler<T extends SendEmailDto> {
  protected readonly logger: Logger;

  @Inject(MailerService)
  protected readonly mailerService!: MailerService;

  @Inject(ConfigService)
  protected readonly configService!: ConfigService;

  constructor (protected readonly loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  protected async handle ({ value }: KafkaMessageRecord<T>): Promise<void> {
    this.logger.log(`[Email Handler]: Received email event`);
    const key = EmailLinkHelper.keyFrom({ configService: this.configService });
    await this.mailerService.sendEmail(EmailLinkHelper.open({ payload: SealedEmailSchema.parse(value), key }));
  }
}
