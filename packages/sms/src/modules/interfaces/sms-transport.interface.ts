import { SendSmsDto } from '../dtos/send-sms.dto';

export interface SmsTransport {
  send(sms: SendSmsDto): Promise<void>;
}
