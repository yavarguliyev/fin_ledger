import { SmsTransportKind } from '@common/shared-libs';

import { SmsService } from '../../src/modules/services/sms.service';
import { ConsoleSmsTransport } from '../../src/modules/transports/console-sms.transport';
import { TwilioTransport } from '../../src/modules/transports/twilio.transport';
import { aConfigService } from '../fakes/config.fake';

const CODE = '482913';
const SMS = { phoneNumber: '+15551234567', message: `Your verification code is ${CODE}`, purpose: 'phone-verification' };

describe('SmsService transport choice', () => {
  it('uses the console transport unless a provider is configured', () => {
    const service = new SmsService({ configService: aConfigService({ values: {} }) });
    expect(service['transport']).toBeInstanceOf(ConsoleSmsTransport);
  });

  it('uses Twilio when the transport is set to twilio', () => {
    const service = new SmsService({
      configService: aConfigService({
        values: {
          SMS_TRANSPORT: SmsTransportKind.TWILIO,
          TWILIO_ACCOUNT_SID: 'AC123',
          TWILIO_AUTH_TOKEN: 'secret',
          SMS_FROM: '+15550000000'
        }
      })
    });

    expect(service['transport']).toBeInstanceOf(TwilioTransport);
  });
});

describe('SmsService sending', () => {
  it('never writes the message body or its code to the log in production', async () => {
    const service = new SmsService({ configService: aConfigService({ values: { NODE_ENV: 'production' } }) });
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

  it('prints the code in local development, because the console transport is the only way to read it', async () => {
    const service = new SmsService({ configService: aConfigService({ values: { NODE_ENV: 'development' } }) });
    const written: string[] = [];

    jest.spyOn(service['logger'], 'log').mockImplementation((message: unknown) => void written.push(String(message)));

    await service.sendSms(SMS);

    expect(written.join(' ')).toContain(CODE);
  });
});

describe('SmsService failures', () => {
  it('reports a provider failure instead of silently dropping the message', async () => {
    const service = new SmsService({ configService: aConfigService({ values: {} }) });
    jest.spyOn(service['transport'], 'send').mockRejectedValue(new Error('twilio unreachable'));
    await expect(service.sendSms(SMS)).rejects.toThrow('twilio unreachable');
  });
});
