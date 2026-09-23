import { createTransport, Transporter } from 'nodemailer';

import { MAIL_CONSTANTS } from '../constants/mail/mail.constant';
import { SendEmailDto } from '../dtos/send-email.dto';
import { SmtpOptionsDto } from '../dtos/smtp-options.dto';
import { MailTransport } from '../interfaces/mail-transport.interface';

export class SmtpTransport implements MailTransport {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor ({ host, port, user, pass, from }: SmtpOptionsDto) {
    this.from = from;
    this.transporter = createTransport({
      host,
      port,
      secure: port === MAIL_CONSTANTS.SMTP_SECURE_PORT,
      ...(user && pass && { auth: { user, pass } })
    });
  }

  async send ({ to, subject, title, body, url }: SendEmailDto): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text: `${title}\n\n${body}\n\n${url}`,
      html: `<h1>${title}</h1><p>${body}</p><p><a href="${url}">${url}</a></p>`
    });
  }
}
