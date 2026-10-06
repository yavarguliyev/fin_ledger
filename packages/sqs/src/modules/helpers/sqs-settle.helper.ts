import { ChangeMessageVisibilityCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { BaseHelper } from '@common/shared-libs';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { FailedSqsMessageDto } from '../dtos/step/failed-sqs-message.dto';
import { SettleSqsMessageDto } from '../dtos/step/settle-sqs-message.dto';

export class SqsSettleHelper {
  static async acknowledge ({ client, queueUrl, message }: SettleSqsMessageDto): Promise<void> {
    await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }));
  }

  static async retry ({ client, queueUrl, queue, message, lastError, logger }: FailedSqsMessageDto): Promise<void> {
    const attempt = Number(message.Attributes?.[C.RECEIVE_COUNT_ATTRIBUTE] ?? C.FIRST_RECEIVE);
    const delay = C.RETRY_DELAYS_SECONDS[attempt - 1];

    if (delay === undefined) logger.error(`Message from ${queue} failed ${attempt} times and moves to its dead-letter queue: ${lastError}`);
    else logger.warn(`Message from ${queue} failed (attempt ${attempt}), retrying in ${delay}s: ${lastError}`);

    try {
      await client.send(
        new ChangeMessageVisibilityCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
          VisibilityTimeout: delay ?? C.IMMEDIATE_RETRY_SECONDS
        })
      );
    } catch (error) {
      logger.warn(`Could not schedule the retry for ${queue}: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}
