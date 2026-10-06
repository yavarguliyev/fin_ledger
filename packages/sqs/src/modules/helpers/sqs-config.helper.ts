import type { SQSClientConfig } from '@aws-sdk/client-sqs';
import { ServiceClientDto } from '@common/shared-libs';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { SqsSettingsDto } from '../dtos/config/sqs-settings.dto';

export class SqsConfigHelper {
  static settings ({ configService }: ServiceClientDto): SqsSettingsDto {
    const topicArn = configService.get<string>('SQS_TOPIC_ARN');
    const queuePrefix = configService.get<string>('SQS_QUEUE_PREFIX');
    const endpoint = configService.get<string>('SQS_ENDPOINT');
    const accessKeyId = configService.get<string>('SQS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get<string>('SQS_SECRET_ACCESS_KEY');

    if (!topicArn) throw new Error(C.MISSING_TOPIC);
    if (!queuePrefix) throw new Error(C.MISSING_PREFIX);

    return {
      region: configService.get<string>('SQS_REGION') ?? C.DEFAULT_REGION,
      topicArn,
      queuePrefix,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && { accessKeyId }),
      ...(secretAccessKey && { secretAccessKey })
    };
  }

  static clientConfig ({ region, endpoint, accessKeyId, secretAccessKey }: SqsSettingsDto): SQSClientConfig {
    return {
      region,
      ...(endpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } })
    };
  }
}
