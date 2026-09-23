import { Logger } from '@nestjs/common';

import { SendSmsDto } from '../dtos/send-sms.dto';
import { SmsTransport } from '../interfaces/sms-transport.interface';

export class ConsoleSmsTransport implements SmsTransport {
  constructor (private readonly logger: Logger) {}

  send ({ phoneNumber, purpose }: SendSmsDto): Promise<void> {
    this.logger.log(`SMS not delivered (console transport). To: ${phoneNumber} | Purpose: ${purpose}`);
    return Promise.resolve();
  }
}
