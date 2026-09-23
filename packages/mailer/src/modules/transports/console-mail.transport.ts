import { Logger } from '@nestjs/common';

import { SendEmailDto } from '../dtos/send-email.dto';
import { MailTransport } from '../interfaces/mail-transport.interface';

export class ConsoleMailTransport implements MailTransport {
  constructor (private readonly logger: Logger) {}

  send ({ to, subject, purpose }: SendEmailDto): Promise<void> {
    this.logger.log(`Email not delivered (console transport). To: ${to} | Subject: ${subject} | Purpose: ${purpose}`);
    return Promise.resolve();
  }
}
