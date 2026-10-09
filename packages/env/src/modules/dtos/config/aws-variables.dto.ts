import { z } from 'zod';
import { QueueTransportKind, ConfigSource } from '@common/shared-libs';

export const AwsVariablesSchema = z.object({
  SES_REGION: z.string({ message: 'SES_REGION must be a string' }).optional(),
  SES_ENDPOINT: z.url({ message: 'SES_ENDPOINT must be a URL' }).optional(),
  SES_ACCESS_KEY_ID: z.string({ message: 'SES_ACCESS_KEY_ID must be a string' }).optional(),
  SES_SECRET_ACCESS_KEY: z.string({ message: 'SES_SECRET_ACCESS_KEY must be a string' }).optional(),
  SECRETS_SOURCE: z.enum(ConfigSource, { message: 'SECRETS_SOURCE must be a valid ConfigSource enum' }).default(ConfigSource.ENV),
  SECRETS_ID: z.string({ message: 'SECRETS_ID must be a string' }).optional(),
  SECRETS_REGION: z.string({ message: 'SECRETS_REGION must be a string' }).optional(),
  SECRETS_ENDPOINT: z.url({ message: 'SECRETS_ENDPOINT must be a URL' }).optional(),
  SECRETS_ACCESS_KEY_ID: z.string({ message: 'SECRETS_ACCESS_KEY_ID must be a string' }).optional(),
  SECRETS_SECRET_ACCESS_KEY: z.string({ message: 'SECRETS_SECRET_ACCESS_KEY must be a string' }).optional(),
  SNS_SMS_REGION: z.string({ message: 'SNS_SMS_REGION must be a string' }).optional(),
  SNS_SMS_ENDPOINT: z.url({ message: 'SNS_SMS_ENDPOINT must be a URL' }).optional(),
  SNS_SMS_ACCESS_KEY_ID: z.string({ message: 'SNS_SMS_ACCESS_KEY_ID must be a string' }).optional(),
  SNS_SMS_SECRET_ACCESS_KEY: z.string({ message: 'SNS_SMS_SECRET_ACCESS_KEY must be a string' }).optional(),
  PARAMETERS_SOURCE: z.enum(ConfigSource, { message: 'PARAMETERS_SOURCE must be a valid ConfigSource enum' }).default(ConfigSource.ENV),
  PARAMETERS_PATH: z.string({ message: 'PARAMETERS_PATH must be a string' }).optional(),
  PARAMETERS_REGION: z.string({ message: 'PARAMETERS_REGION must be a string' }).optional(),
  PARAMETERS_ENDPOINT: z.url({ message: 'PARAMETERS_ENDPOINT must be a URL' }).optional(),
  PARAMETERS_ACCESS_KEY_ID: z.string({ message: 'PARAMETERS_ACCESS_KEY_ID must be a string' }).optional(),
  PARAMETERS_SECRET_ACCESS_KEY: z.string({ message: 'PARAMETERS_SECRET_ACCESS_KEY must be a string' }).optional(),
  QUEUE_TRANSPORT: z.enum(QueueTransportKind, { message: 'QUEUE_TRANSPORT must be a valid QueueTransportKind enum' }).default(QueueTransportKind.RABBITMQ),
  SQS_REGION: z.string({ message: 'SQS_REGION must be a string' }).optional(),
  SQS_ENDPOINT: z.url({ message: 'SQS_ENDPOINT must be a URL' }).optional(),
  SQS_ACCESS_KEY_ID: z.string({ message: 'SQS_ACCESS_KEY_ID must be a string' }).optional(),
  SQS_SECRET_ACCESS_KEY: z.string({ message: 'SQS_SECRET_ACCESS_KEY must be a string' }).optional(),
  SQS_TOPIC_ARN: z.string({ message: 'SQS_TOPIC_ARN must be a string' }).optional(),
  SQS_WEBHOOK_QUEUE: z.string({ message: 'SQS_WEBHOOK_QUEUE must be a string' }).optional(),
  SQS_QUEUE_PREFIX: z.string({ message: 'SQS_QUEUE_PREFIX must be a string' }).optional()
});

export type AwsVariablesDto = z.infer<typeof AwsVariablesSchema>;
