import { AnalyticsEventTopic } from '../../enums/common/analytics.enum';
import { AuditEventTopic } from '../../enums/common/audit.enum';
import { EmailTemplateType } from '../../enums/common/email.enum';

export const KAFKA_TOPICS: string[] = [...Object.values(AuditEventTopic), ...Object.values(AnalyticsEventTopic), ...Object.values(EmailTemplateType)];
