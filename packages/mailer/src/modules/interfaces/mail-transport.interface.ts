import { SendEmailDto } from '../dtos/send-email.dto';

export interface MailTransport {
  readonly delivers: boolean;
  send(email: SendEmailDto): Promise<void>;
}
