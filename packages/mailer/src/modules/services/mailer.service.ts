import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, ServiceClientDto, BaseHelper, MailTransportKind } from '@common/shared-libs';

import { MAIL_CONSTANTS } from '../constants/mail/mail.constant';
import { SendEmailDto } from '../dtos/send-email.dto';
import { MailTransport } from '../interfaces/mail-transport.interface';
import { ConsoleMailTransport } from '../transports/console-mail.transport';
import { SmtpTransport } from '../transports/smtp.transport';

@Injectable()
export class MailerService {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private readonly from: string;
  private readonly transport: MailTransport;

  private readonly configService: ConfigService;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.configService = configService;
    this.clientId = clientId || ClientIds.DEFAULT;
    this.logger = new Logger(`${MailerService.name}:${this.clientId}`);
    this.from = this.configService.get<string>('EMAIL_FROM')!;
    this.transport = this.resolveTransport();
  }

  async sendEmail (email: SendEmailDto): Promise<void> {
    try {
      await this.transport.send(email);
      this.logger.log(`Email sent. To: ${email.to} | Subject: ${email.subject} | Purpose: ${email.purpose}`);
    } catch (error) {
      this.logger.error(`Email to ${email.to} (${email.purpose}) failed: ${BaseHelper.errorResponse({ error }).message}`);
      throw error;
    }
  }

  private resolveTransport (): MailTransport {
    const kind = this.configService.get<MailTransportKind>('MAIL_TRANSPORT') ?? MailTransportKind.CONSOLE;

    if (kind !== MailTransportKind.SMTP) return new ConsoleMailTransport(this.logger);

    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    return new SmtpTransport({
      host: this.configService.get<string>('SMTP_HOST')!,
      port: this.configService.get<number>('SMTP_PORT') ?? MAIL_CONSTANTS.SMTP_DEFAULT_PORT,
      from: this.from,
      ...(user && { user }),
      ...(pass && { pass })
    });
  }
}
