import { MailTransportKind } from '@common/shared-libs';
import { SendEmailCommand } from '@aws-sdk/client-ses';

import { MailerService } from '../../src/modules/services/mailer.service';
import { SendEmailDto } from '../../src/modules/dtos/send-email.dto';
import { SesTransport } from '../../src/modules/transports/ses.transport';
import { MAILER_TEST as T } from '../constants/mailer.constant';
import { aConfigService } from '../fakes/config.fake';

const send = jest.fn().mockResolvedValue({});

jest.mock('@aws-sdk/client-ses', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-ses')>('@aws-sdk/client-ses');
  return { ...actual, SESClient: jest.fn(() => ({ send })) };
});

const EMAIL: SendEmailDto = {
  to: T.TO,
  subject: T.SUBJECT,
  purpose: T.PURPOSE,
  title: T.SUBJECT,
  body: T.BODY,
  url: `${T.RESET_URL}${T.TOKEN}`
};

describe('MailerService with SES', () => {
  it('sends through SES from the configured address with the shared message format', async () => {
    const settings = {
      MAIL_TRANSPORT: MailTransportKind.SES,
      SES_ENDPOINT: T.SES_ENDPOINT,
      SES_REGION: T.SES_REGION,
      SES_ACCESS_KEY_ID: T.SES_KEY,
      SES_SECRET_ACCESS_KEY: T.SES_KEY
    };
    const service = new MailerService({ configService: aConfigService({ settings }) });

    await service.sendEmail(EMAIL);

    const [command] = send.mock.calls[0] as [SendEmailCommand];
    expect(service['transport']).toBeInstanceOf(SesTransport);
    expect(command.input).toMatchObject({ Source: T.FROM, Destination: { ToAddresses: [EMAIL.to] } });
    expect(command.input.Message?.Body?.Html?.Data).toContain(EMAIL.url);
  });
});
