import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { MailTransportKind } from '@common/shared-libs';

import { MailerService } from '../modules/services/mailer.service';
import { SendEmailDto } from '../modules/dtos/send-email.dto';

const sendMail = jest.fn().mockResolvedValue(undefined);

jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({ sendMail })) }));

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.super-secret-reset-token';
const FROM = 'no-reply@wallet.test';

const EMAIL: SendEmailDto = {
  to: 'player@wallet.test',
  subject: 'Reset your password',
  purpose: 'password-reset',
  title: 'Reset your password',
  body: 'Use the link below.',
  url: `https://wallet.test/reset?token=${TOKEN}`
};

const buildService = ({ settings }: { settings: Record<string, string> }): MailerService => {
  const configService = { get: (key: string) => settings[key] ?? (key === 'EMAIL_FROM' ? FROM : undefined) } as unknown as ConfigService;
  return new MailerService({ configService });
};

describe('MailerService', () => {
  let logged: string[];

  beforeEach(() => {
    logged = [];
    jest.spyOn(Logger.prototype, 'log').mockImplementation(message => void logged.push(String(message)));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(message => void logged.push(String(message)));
  });

  afterEach(() => jest.restoreAllMocks());

  it('never writes the link or its token to the log', async () => {
    const service = buildService({ settings: { MAIL_TRANSPORT: MailTransportKind.CONSOLE } });

    await service.sendEmail(EMAIL);

    expect(logged).not.toHaveLength(0);
    expect(logged.some(line => line.includes(TOKEN))).toBe(false);
    expect(logged.some(line => line.includes(EMAIL.url))).toBe(false);
    expect(logged.some(line => line.includes(EMAIL.to) && line.includes(EMAIL.subject))).toBe(true);
  });

  it('hands the message to SMTP when that transport is configured', async () => {
    const service = buildService({ settings: { MAIL_TRANSPORT: MailTransportKind.SMTP, SMTP_HOST: 'smtp.wallet.test' } });

    await service.sendEmail(EMAIL);

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: FROM, to: EMAIL.to, subject: EMAIL.subject }));
    expect(logged.some(line => line.includes(TOKEN))).toBe(false);
  });

  it('keeps the token out of the log when delivery fails', async () => {
    sendMail.mockRejectedValueOnce(new Error('smtp refused'));
    const service = buildService({ settings: { MAIL_TRANSPORT: MailTransportKind.SMTP, SMTP_HOST: 'smtp.wallet.test' } });

    await expect(service.sendEmail(EMAIL)).rejects.toThrow('smtp refused');
    expect(logged.some(line => line.includes(TOKEN))).toBe(false);
  });
});
