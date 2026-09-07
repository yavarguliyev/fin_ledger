import { Injectable, Logger } from '@nestjs/common';
import { EmailProviderService, KafkaMessageRecord, SendEmailDto } from '@common/libs';

@Injectable()
export abstract class EmailBaseHandler<T extends SendEmailDto> {
  protected readonly logger: Logger;

  constructor (
    loggerContext: string,
    protected readonly emailService: EmailProviderService
  ) {
    this.logger = new Logger(loggerContext);
  }

  protected handle ({ value }: KafkaMessageRecord<T>): void {
    this.logger.log(`[Email Handler]: Received email event`);
    this.emailService.sendEmail(value);
  }
}
