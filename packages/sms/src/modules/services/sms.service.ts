import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, ServiceClientDto } from '@common/shared-libs';

import { SendSmsDto } from '../dtos/send-sms.dto';

@Injectable()
export class SmsService {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private readonly from: string;

  private readonly configService: ConfigService;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.configService = configService;
    this.clientId = clientId || ClientIds.DEAFULT;
    this.logger = new Logger(`${SmsService.name}:${this.clientId}`);
    this.from = this.configService.get<string>('SMS_FROM') ?? 'SYSTEM';
  }

  sendSms ({ phoneNumber, message, purpose }: SendSmsDto): void {
    this.logger.log(['SMS sent', `From: ${this.from}`, `To: ${phoneNumber}`, `Purpose: ${purpose}`, `Message: ${message}`].join('\n'));
  }
}
