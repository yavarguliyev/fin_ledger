import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds } from '@common/shared-libs';

import { SendEmailDto } from '../dtos/send-email.dto';

@Injectable()
export class MailerService {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private readonly from: string;

  constructor (
    private readonly configService: ConfigService,
    clientId?: ClientIds
  ) {
    this.clientId = clientId || ClientIds.DEAFULT;
    this.logger = new Logger(`${MailerService.name}:${this.clientId}`);
    this.from = this.configService.get<string>('EMAIL_FROM')!;
  }

  sendEmail ({ subject, purpose, title, body, url }: SendEmailDto): void {
    this.logger.log(
      ['Email sent', `From: ${this.from}`, `Subject: ${subject}`, `Purpose: ${purpose}`, `Title: ${title}`, `Body: ${body}`, `URL: ${url}`].join('\n')
    );
  }
}
