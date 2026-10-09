import { PublishCommand } from '@aws-sdk/client-sns';
import { SmsTransportKind } from '@common/shared-libs';

import { SMS_CONSTANTS as C } from '../../src/modules/constants/sms/sms.constant';
import { SmsService } from '../../src/modules/services/sms.service';
import { SnsSmsTransport } from '../../src/modules/transports/sns-sms.transport';
import { SNS_SMS_TEST as T } from '../constants/sns-sms.constant';
import { aConfigService } from '../fakes/config.fake';

const send = jest.fn().mockResolvedValue({});

jest.mock('@aws-sdk/client-sns', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-sns')>('@aws-sdk/client-sns');
  return { ...actual, SNSClient: jest.fn(() => ({ send })) };
});

const SETTINGS = {
  SMS_TRANSPORT: SmsTransportKind.SNS,
  SNS_SMS_ENDPOINT: T.ENDPOINT,
  SNS_SMS_REGION: T.REGION,
  SNS_SMS_ACCESS_KEY_ID: T.KEY,
  SNS_SMS_SECRET_ACCESS_KEY: T.KEY
};

describe('SmsService with SNS', () => {
  afterEach(() => send.mockClear());

  it('publishes a transactional text straight to the phone number from the configured sender', async () => {
    const service = new SmsService({ configService: aConfigService({ values: { ...SETTINGS, SMS_FROM: T.SENDER } }) });

    await service.sendSms({ phoneNumber: T.PHONE, message: T.MESSAGE, purpose: T.PURPOSE });

    const [command] = send.mock.calls[0] as [PublishCommand];
    expect(service['transport']).toBeInstanceOf(SnsSmsTransport);
    expect(command.input).toMatchObject({
      PhoneNumber: T.PHONE,
      Message: T.MESSAGE,
      MessageAttributes: {
        [C.SNS_SENDER_ID_ATTRIBUTE]: { StringValue: T.SENDER },
        [C.SNS_SMS_TYPE_ATTRIBUTE]: { StringValue: C.SNS_SMS_TYPE }
      }
    });
  });

  it('falls back to the default sender when none is configured', async () => {
    const service = new SmsService({ configService: aConfigService({ values: SETTINGS }) });

    await service.sendSms({ phoneNumber: T.PHONE, message: T.MESSAGE, purpose: T.PURPOSE });

    const [command] = send.mock.calls[0] as [PublishCommand];
    expect(command.input.MessageAttributes?.[C.SNS_SENDER_ID_ATTRIBUTE]?.StringValue).toBe(C.DEFAULT_SENDER);
  });
});
