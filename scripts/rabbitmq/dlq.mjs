import { Logger } from '@nestjs/common';
import { QueueHelper, RabbitmqService, RABBITMQ_TOPOLOGY } from '@common/rabbitmq';

Logger.overrideLogger(false);

const USAGE = 'Usage: dlq.mjs <depth|replay> <queue> [limit]';
const [command, queue, limit] = process.argv.slice(2);

if (!command || !queue) {
  console.error(USAGE);
  process.exit(1);
}

const configService = { get: key => process.env[key] };
const service = new RabbitmqService({ configService });

await service.onModuleInit();

try {
  if (command === 'depth') {
    const targets = [
      queue,
      ...RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.map((_, index) => QueueHelper.retryQueue({ queue, attempt: index + 1 })),
      QueueHelper.deadLetterQueue({ queue })
    ];

    for (const target of targets) console.log(`${target}\t${await service.queueDepth({ queue: target })}`);
  } else if (command === 'replay') {
    const replayed = await service.replayDeadLetters({ queue, ...(limit && { limit: Number(limit) }) });
    console.log(`Replayed ${replayed} message(s) from ${QueueHelper.deadLetterQueue({ queue })} into ${queue}`);
  } else {
    console.error(USAGE);
    process.exitCode = 1;
  }
} finally {
  await service.onModuleDestroy();
}
