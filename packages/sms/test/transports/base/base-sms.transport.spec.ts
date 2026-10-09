import { BaseSmsTransport } from '../../../src/modules/transports/base/base-sms.transport';
import { SmsMessageDto } from '../../../src/modules/dtos/sms-message.dto';
import { SNS_SMS_TEST as T } from '../../constants/sns-sms.constant';

const deliver = jest.fn().mockResolvedValue(undefined);

class RecordingTransport extends BaseSmsTransport {
  constructor () {
    super({ from: T.SENDER });
  }

  protected deliver (message: SmsMessageDto): Promise<void> {
    return deliver(message) as Promise<void>;
  }
}

describe('BaseSmsTransport', () => {
  it('hands deliver the configured sender, the recipient and the body', async () => {
    const transport = new RecordingTransport();

    await transport.send({ phoneNumber: T.PHONE, message: T.MESSAGE, purpose: T.PURPOSE });

    expect(transport.delivers).toBe(true);
    expect(deliver).toHaveBeenCalledWith({ from: T.SENDER, to: T.PHONE, body: T.MESSAGE });
  });
});
