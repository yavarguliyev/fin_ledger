import { Logger } from '@nestjs/common';
import { MailTransportKind } from '@common/shared-libs';

import { MailerService } from '../../src/modules/services/mailer.service';
import { SendEmailDto } from '../../src/modules/dtos/send-email.dto';
import { MAILER_TEST as T } from '../constants/mailer.constant';
import { aConfigService } from '../fakes/config.fake';
import { ConfigFakeDto } from '../interfaces/config-fake.interface';

const sendMail = jest.fn().mockResolvedValue(undefined);

jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({ sendMail })) }));

const EMAIL: SendEmailDto = {
  to: T.TO,
  subject: T.SUBJECT,
  purpose: T.PURPOSE,
  title: T.SUBJECT,
  body: T.BODY,
  url: `${T.RESET_URL}${T.TOKEN}`
};

const buildService = ({ settings }: ConfigFakeDto): MailerService => new MailerService({ configService: aConfigService({ settings }) });

describe('MailerService', () => {
  let logged: string[];

  beforeEach(() => {
    logged = [];
    jest.spyOn(Logger.prototype, 'log').mockImplementation(message => void logged.push(String(message)));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(message => void logged.push(String(message)));
  });

  afterEach(() => jest.restoreAllMocks());

  it('prints the link in local development, because the console transport is the only way to open it', async () => {
    const service = buildService({ settings: { NODE_ENV: T.DEVELOPMENT } });
    const written: string[] = [];

    jest.spyOn(service['logger'], 'log').mockImplementation((message: unknown) => void written.push(String(message)));

    await service.sendEmail(EMAIL);

    expect(written.join(' ')).toContain(EMAIL.url);
  });

  it('never writes the link or its token to the log in production', async () => {
    const service = buildService({ settings: { MAIL_TRANSPORT: MailTransportKind.CONSOLE, NODE_ENV: T.PRODUCTION } });

    await service.sendEmail(EMAIL);

    expect(logged).not.toHaveLength(0);
    expect(logged.some(line => line.includes(T.TOKEN))).toBe(false);
    expect(logged.some(line => line.includes(EMAIL.url))).toBe(false);
    expect(logged.some(line => line.includes(EMAIL.to) && line.includes(EMAIL.subject))).toBe(true);
  });

  it('hands the message to SMTP when that transport is configured', async () => {
    const service = buildService({ settings: { MAIL_TRANSPORT: MailTransportKind.SMTP, SMTP_HOST: T.SMTP_HOST } });

    await service.sendEmail(EMAIL);

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: T.FROM, to: EMAIL.to, subject: EMAIL.subject }));
    expect(logged.some(line => line.includes(T.TOKEN))).toBe(false);
  });

  it('keeps the token out of the log when delivery fails', async () => {
    sendMail.mockRejectedValueOnce(new Error(T.SMTP_ERROR));
    const service = buildService({ settings: { MAIL_TRANSPORT: MailTransportKind.SMTP, SMTP_HOST: T.SMTP_HOST } });

    await expect(service.sendEmail(EMAIL)).rejects.toThrow(T.SMTP_ERROR);
    expect(logged.some(line => line.includes(T.TOKEN))).toBe(false);
  });
});
