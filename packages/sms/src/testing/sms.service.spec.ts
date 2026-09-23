import type { ConfigService } from '@nestjs/config';
import { SmsTransportKind } from '@common/shared-libs';

import { SmsService } from '../modules/services/sms.service';
import { ConsoleSmsTransport } from '../modules/transports/console-sms.transport';
import { TwilioTransport } from '../modules/transports/twilio.transport';

const CODE = '482913';

const SMS = { phoneNumber: '+15551234567', message: `Your verification code is ${CODE}`, purpose: 'phone-verification' };

const buildConfig = (values: Record<string, unknown>): ConfigService => ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('SmsService', () => {
  it('uses the console transport unless a provider is configured', () => {
    const service = new SmsService({ configService: buildConfig({}) });

    expect(service['transport']).toBeInstanceOf(ConsoleSmsTransport);
  });

  it('uses Twilio when the transport is set to twilio', () => {
    const service = new SmsService({
      configService: buildConfig({ SMS_TRANSPORT: SmsTransportKind.TWILIO, TWILIO_ACCOUNT_SID: 'AC123', TWILIO_AUTH_TOKEN: 'secret', SMS_FROM: '+15550000000' })
    });

    expect(service['transport']).toBeInstanceOf(TwilioTransport);
  });

  it('never writes the message body or its code to the log', async () => {
    const service = new SmsService({ configService: buildConfig({}) });
    const written: string[] = [];

    jest.spyOn(service['logger'], 'log').mockImplementation((message: unknown) => void written.push(String(message)));

    await service.sendSms(SMS);

    expect(written.length).toBeGreaterThan(0);
    written.forEach(line => {
      expect(line).not.toContain(CODE);
      expect(line).not.toContain(SMS.message);
    });
    expect(written.join(' ')).toContain(SMS.phoneNumber);
  });

  it('reports a provider failure instead of silently dropping the message', async () => {
    const service = new SmsService({ configService: buildConfig({}) });
    jest.spyOn(service['transport'], 'send').mockRejectedValue(new Error('twilio unreachable'));

    await expect(service.sendSms(SMS)).rejects.toThrow('twilio unreachable');
  });
});
