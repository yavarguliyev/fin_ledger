import { createTransport, Transporter } from 'nodemailer';

import { BaseMailTransport } from './base/base-mail.transport';
import { MAIL_CONSTANTS } from '../constants/mail/mail.constant';
import { MailMessageDto } from '../dtos/mail-message.dto';
import { SmtpOptionsDto } from '../dtos/smtp-options.dto';

export class SmtpTransport extends BaseMailTransport {
  private readonly transporter: Transporter;

  constructor ({ host, port, user, pass, from }: SmtpOptionsDto) {
    super({ from });
    this.transporter = createTransport({
      host,
      port,
      secure: port === MAIL_CONSTANTS.SMTP_SECURE_PORT,
      ...(user && pass && { auth: { user, pass } })
    });
  }

  protected async deliver (message: MailMessageDto): Promise<void> {
    await this.transporter.sendMail(message);
  }
}
