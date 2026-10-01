import { Logger } from '@nestjs/common';

import { SMS_CONSTANTS } from '../constants/sms/sms.constant';
import { ConsoleSmsTransportDto } from '../dtos/console-sms-transport.dto';
import { SendSmsDto } from '../dtos/send-sms.dto';
import { SmsTransport } from '../interfaces/sms-transport.interface';

export class ConsoleSmsTransport implements SmsTransport {
  readonly delivers = false;

  private readonly logger: Logger;
  private readonly revealBody: boolean;

  constructor ({ logger, revealBody }: ConsoleSmsTransportDto) {
    this.logger = logger;
    this.revealBody = revealBody;
  }

  send ({ phoneNumber, purpose, message }: SendSmsDto): Promise<void> {
    const header = `${SMS_CONSTANTS.CONSOLE_PREFIX} To: ${phoneNumber} | Purpose: ${purpose}`;
    this.logger.log(this.revealBody ? `${header}\n${SMS_CONSTANTS.BODY_PREFIX} ${message}` : header);
    return Promise.resolve();
  }
}
