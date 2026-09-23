import { SendEmailDto } from '../dtos/send-email.dto';

export interface MailTransport {
  send(email: SendEmailDto): Promise<void>;
}
