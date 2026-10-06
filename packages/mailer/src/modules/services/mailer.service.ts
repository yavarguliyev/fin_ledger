import { Injectable, Logger } from '@nestjs/common';
import { ClientIds, ServiceClientDto, BaseHelper } from '@common/shared-libs';

import { SendEmailDto } from '../dtos/send-email.dto';
import { MailTransportHelper } from '../helpers/mail-transport.helper';
import { MailTransport } from '../interfaces/mail-transport.interface';

@Injectable()
export class MailerService {
  private readonly logger: Logger;
  private readonly transport: MailTransport;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.logger = new Logger(`${MailerService.name}:${clientId || ClientIds.DEFAULT}`);
    this.transport = MailTransportHelper.resolve({ configService, logger: this.logger, from: configService.get<string>('EMAIL_FROM')! });
  }

  async sendEmail (email: SendEmailDto): Promise<void> {
    try {
      await this.transport.send(email);
      if (this.transport.delivers) this.logger.log(`Email sent. To: ${email.to} | Subject: ${email.subject} | Purpose: ${email.purpose}`);
    } catch (error) {
      this.logger.error(`Email to ${email.to} (${email.purpose}) failed: ${BaseHelper.errorResponse({ error }).message}`);
      throw error;
    }
  }
}
