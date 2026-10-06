import { z } from 'zod';
import { QueueTransportKind, SecretsSource } from '@common/shared-libs';

export const AwsVariablesSchema = z.object({
  SES_REGION: z.string({ message: 'SES_REGION must be a string' }).optional(),
  SES_ENDPOINT: z.url({ message: 'SES_ENDPOINT must be a URL' }).optional(),
  SES_ACCESS_KEY_ID: z.string({ message: 'SES_ACCESS_KEY_ID must be a string' }).optional(),
  SES_SECRET_ACCESS_KEY: z.string({ message: 'SES_SECRET_ACCESS_KEY must be a string' }).optional(),
  SECRETS_SOURCE: z.enum(SecretsSource, { message: 'SECRETS_SOURCE must be a valid SecretsSource enum' }).default(SecretsSource.ENV),
  SECRETS_ID: z.string({ message: 'SECRETS_ID must be a string' }).optional(),
  SECRETS_REGION: z.string({ message: 'SECRETS_REGION must be a string' }).optional(),
  SECRETS_ENDPOINT: z.url({ message: 'SECRETS_ENDPOINT must be a URL' }).optional(),
  SECRETS_ACCESS_KEY_ID: z.string({ message: 'SECRETS_ACCESS_KEY_ID must be a string' }).optional(),
  SECRETS_SECRET_ACCESS_KEY: z.string({ message: 'SECRETS_SECRET_ACCESS_KEY must be a string' }).optional(),
  QUEUE_TRANSPORT: z.enum(QueueTransportKind, { message: 'QUEUE_TRANSPORT must be a valid QueueTransportKind enum' }).default(QueueTransportKind.RABBITMQ),
  SQS_REGION: z.string({ message: 'SQS_REGION must be a string' }).optional(),
  SQS_ENDPOINT: z.url({ message: 'SQS_ENDPOINT must be a URL' }).optional(),
  SQS_ACCESS_KEY_ID: z.string({ message: 'SQS_ACCESS_KEY_ID must be a string' }).optional(),
  SQS_SECRET_ACCESS_KEY: z.string({ message: 'SQS_SECRET_ACCESS_KEY must be a string' }).optional(),
  SQS_TOPIC_ARN: z.string({ message: 'SQS_TOPIC_ARN must be a string' }).optional(),
  SQS_QUEUE_PREFIX: z.string({ message: 'SQS_QUEUE_PREFIX must be a string' }).optional()
});

export type AwsVariablesDto = z.infer<typeof AwsVariablesSchema>;
