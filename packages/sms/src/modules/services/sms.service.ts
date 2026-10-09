import { Injectable, Logger } from '@nestjs/common';
import { ClientIds, ServiceClientDto, BaseHelper } from '@common/shared-libs';

import { SMS_CONSTANTS } from '../constants/sms/sms.constant';
import { SendSmsDto } from '../dtos/send-sms.dto';
import { SmsTransportHelper } from '../helpers/sms-transport.helper';
import { SmsTransport } from '../interfaces/sms-transport.interface';

@Injectable()
export class SmsService {
  private readonly logger: Logger;
  private readonly transport: SmsTransport;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.logger = new Logger(`${SmsService.name}:${clientId || ClientIds.DEFAULT}`);
    this.transport = SmsTransportHelper.resolve({
      configService,
      logger: this.logger,
      from: configService.get<string>('SMS_FROM') ?? SMS_CONSTANTS.DEFAULT_SENDER
    });
  }

  async sendSms (sms: SendSmsDto): Promise<void> {
    try {
      await this.transport.send(sms);
      if (this.transport.delivers) this.logger.log(`SMS sent. To: ${sms.phoneNumber} | Purpose: ${sms.purpose}`);
    } catch (error) {
      this.logger.error(`SMS to ${sms.phoneNumber} (${sms.purpose}) failed: ${BaseHelper.errorResponse({ error }).message}`);
      throw error;
    }
  }
}
