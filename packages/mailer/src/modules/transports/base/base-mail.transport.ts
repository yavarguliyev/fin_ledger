import { MailMessageHelper } from '../../helpers/mail-message.helper';
import { BaseTransportDto } from '../../dtos/base-transport.dto';
import { MailMessageDto } from '../../dtos/mail-message.dto';
import { SendEmailDto } from '../../dtos/send-email.dto';
import { MailTransport } from '../../interfaces/mail-transport.interface';

export abstract class BaseMailTransport implements MailTransport {
  readonly delivers = true;

  protected readonly from: string;

  protected constructor ({ from }: BaseTransportDto) {
    this.from = from;
  }

  async send (email: SendEmailDto): Promise<void> {
    await this.deliver(MailMessageHelper.compose({ email, from: this.from }));
  }

  protected abstract deliver (message: MailMessageDto): Promise<void>;
}
