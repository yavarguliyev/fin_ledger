import { EmailTemplateType } from '../../enums/common/email.enum';

export const KAFKA_RETENTION = {
  CONFIG_NAME: 'retention.ms',
  SHORT_RETENTION_MS: 86_400_000,
  SHORT_RETENTION_TOPICS: Object.values(EmailTemplateType) as string[]
} as const;
