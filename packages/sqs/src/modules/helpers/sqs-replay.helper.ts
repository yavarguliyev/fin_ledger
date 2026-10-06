import { DeleteMessageCommand, ReceiveMessageCommand, SendMessageCommand } from '@aws-sdk/client-sqs';

import { SQS_CONSTANTS as C } from '../constants/sqs/sqs.constant';
import { ReplaySqsDto } from '../dtos/step/replay-sqs.dto';

export class SqsReplayHelper {
  static async replay ({ client, sourceUrl, targetUrl, limit, logger }: ReplaySqsDto): Promise<number> {
    let moved = 0;

    while (moved < limit) {
      const { Messages = [] } = await client.send(
        new ReceiveMessageCommand({ QueueUrl: sourceUrl, MaxNumberOfMessages: Math.min(C.MAX_MESSAGES, limit - moved), MessageAttributeNames: [C.ALL_ATTRIBUTES] })
      );
      if (Messages.length === 0) break;

      for (const { Body, MessageAttributes, ReceiptHandle } of Messages) {
        await client.send(new SendMessageCommand({ QueueUrl: targetUrl, MessageBody: Body, MessageAttributes }));
        await client.send(new DeleteMessageCommand({ QueueUrl: sourceUrl, ReceiptHandle }));
        moved += 1;
      }
    }

    logger.log(`Replayed ${moved} message(s) from ${sourceUrl} into ${targetUrl}`);

    return moved;
  }
}
