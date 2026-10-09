import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { BaseSmsTransport } from './base/base-sms.transport';
import { SMS_CONSTANTS as C } from '../constants/sms/sms.constant';
import { SmsMessageDto } from '../dtos/sms-message.dto';
import { SnsSmsOptionsDto } from '../dtos/sns-sms-options.dto';

export class SnsSmsTransport extends BaseSmsTransport {
  private readonly client: SNSClient;

  constructor ({ region, endpoint, accessKeyId, secretAccessKey, from }: SnsSmsOptionsDto) {
    super({ from });
    this.client = new SNSClient({
      region,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } })
    });
  }

  protected async deliver ({ from, to, body }: SmsMessageDto): Promise<void> {
    await this.client.send(
      new PublishCommand({
        PhoneNumber: to,
        Message: body,
        MessageAttributes: {
          [C.SNS_SENDER_ID_ATTRIBUTE]: { DataType: C.SNS_STRING_TYPE, StringValue: from },
          [C.SNS_SMS_TYPE_ATTRIBUTE]: { DataType: C.SNS_STRING_TYPE, StringValue: C.SNS_SMS_TYPE }
        }
      })
    );
  }
}
