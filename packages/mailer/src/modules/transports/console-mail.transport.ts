import { Logger } from '@nestjs/common';

import { MAIL_CONSTANTS } from '../constants/mail/mail.constant';
import { ConsoleTransportDto } from '../dtos/console-transport.dto';
import { SendEmailDto } from '../dtos/send-email.dto';
import { MailTransport } from '../interfaces/mail-transport.interface';

export class ConsoleMailTransport implements MailTransport {
  readonly delivers = false;

  private readonly logger: Logger;
  private readonly revealLink: boolean;

  constructor ({ logger, revealLink }: ConsoleTransportDto) {
    this.logger = logger;
    this.revealLink = revealLink;
  }

  send ({ to, subject, purpose, url }: SendEmailDto): Promise<void> {
    const header = `${MAIL_CONSTANTS.CONSOLE_PREFIX} To: ${to} | Subject: ${subject} | Purpose: ${purpose}`;
    this.logger.log(this.revealLink ? `${header}\n${MAIL_CONSTANTS.LINK_PREFIX} ${url}` : header);
    return Promise.resolve();
  }
}
