import { Inject, Logger } from '@nestjs/common';
import { MailerService, KafkaMessageRecord, SendEmailDto } from '@common/libs';

export abstract class EmailBaseHandler<T extends SendEmailDto> {
  protected readonly logger: Logger;

  @Inject(MailerService)
  protected readonly mailerService!: MailerService;

  constructor (protected readonly loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  protected async handle ({ value }: KafkaMessageRecord<T>): Promise<void> {
    this.logger.log(`[Email Handler]: Received email event`);
    await this.mailerService.sendEmail(value);
  }
}
