import { SendSmsDto } from '../dtos/send-sms.dto';

export interface SmsTransport {
  readonly delivers: boolean;

  send(sms: SendSmsDto): Promise<void>;
}
