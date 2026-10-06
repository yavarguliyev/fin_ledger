import { BaseMailTransport } from '../../../src/modules/transports/base/base-mail.transport';
import { MailMessageDto } from '../../../src/modules/dtos/mail-message.dto';
import { SendEmailDto } from '../../../src/modules/dtos/send-email.dto';
import { MAILER_TEST as T } from '../../constants/mailer.constant';

const deliver = jest.fn().mockResolvedValue(undefined);

class RecordingTransport extends BaseMailTransport {
  constructor () {
    super({ from: T.FROM });
  }

  protected deliver (message: MailMessageDto): Promise<void> {
    return deliver(message) as Promise<void>;
  }
}

const EMAIL: SendEmailDto = {
  to: T.TO,
  subject: T.SUBJECT,
  purpose: T.PURPOSE,
  title: T.SUBJECT,
  body: T.BODY,
  url: `${T.RESET_URL}${T.TOKEN}`
};

describe('BaseMailTransport', () => {
  it('composes the shared message from the configured sender and hands it to deliver', async () => {
    const transport = new RecordingTransport();

    await transport.send(EMAIL);

    const [message] = deliver.mock.calls[0] as [MailMessageDto];
    expect(transport.delivers).toBe(true);
    expect(message).toMatchObject({ from: T.FROM, to: EMAIL.to, subject: EMAIL.subject });
    expect(message.text).toContain(EMAIL.url);
    expect(message.html).toContain(EMAIL.url);
  });
});
