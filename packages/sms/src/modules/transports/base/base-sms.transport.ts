import { BaseSmsTransportDto } from '../../dtos/base-sms-transport.dto';
import { SendSmsDto } from '../../dtos/send-sms.dto';
import { SmsMessageDto } from '../../dtos/sms-message.dto';
import { SmsTransport } from '../../interfaces/sms-transport.interface';

export abstract class BaseSmsTransport implements SmsTransport {
  readonly delivers = true;

  protected readonly from: string;

  protected constructor ({ from }: BaseSmsTransportDto) {
    this.from = from;
  }

  async send ({ phoneNumber, message }: SendSmsDto): Promise<void> {
    await this.deliver({ from: this.from, to: phoneNumber, body: message });
  }

  protected abstract deliver (message: SmsMessageDto): Promise<void>;
}
