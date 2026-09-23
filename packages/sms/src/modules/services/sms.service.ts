import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientIds, ServiceClientDto, BaseHelper, SmsTransportKind } from '@common/shared-libs';

import { SMS_CONSTANTS } from '../constants/sms/sms.constant';
import { SendSmsDto } from '../dtos/send-sms.dto';
import { SmsTransport } from '../interfaces/sms-transport.interface';
import { ConsoleSmsTransport } from '../transports/console-sms.transport';
import { TwilioTransport } from '../transports/twilio.transport';

@Injectable()
export class SmsService {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private readonly from: string;
  private readonly transport: SmsTransport;

  private readonly configService: ConfigService;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.configService = configService;
    this.clientId = clientId || ClientIds.DEFAULT;
    this.logger = new Logger(`${SmsService.name}:${this.clientId}`);
    this.from = this.configService.get<string>('SMS_FROM') ?? SMS_CONSTANTS.DEFAULT_SENDER;
    this.transport = this.resolveTransport();
  }

  async sendSms (sms: SendSmsDto): Promise<void> {
    try {
      await this.transport.send(sms);
      this.logger.log(`SMS sent. To: ${sms.phoneNumber} | Purpose: ${sms.purpose}`);
    } catch (error) {
      this.logger.error(`SMS to ${sms.phoneNumber} (${sms.purpose}) failed: ${BaseHelper.errorResponse({ error }).message}`);
      throw error;
    }
  }

  private resolveTransport (): SmsTransport {
    const kind = this.configService.get<SmsTransportKind>('SMS_TRANSPORT') ?? SmsTransportKind.CONSOLE;

    if (kind !== SmsTransportKind.TWILIO) return new ConsoleSmsTransport(this.logger);

    const baseUrl = this.configService.get<string>('TWILIO_API_BASE');

    return new TwilioTransport({
      accountSid: this.configService.get<string>('TWILIO_ACCOUNT_SID')!,
      authToken: this.configService.get<string>('TWILIO_AUTH_TOKEN')!,
      from: this.from,
      ...(baseUrl && { baseUrl })
    });
  }
}
